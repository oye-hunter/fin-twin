import { NextRequest, NextResponse } from 'next/server';
import { db, slackLinks, entries, categories, people } from '@fin-twin/db';
import { parseDumpEntries, transcribeAudio, ValidatedEntry } from '@fin-twin/core';
import { verifySlackSignature, sendSlackMessage, downloadSlackFile } from '@/lib/slack';
import { eq, or, isNull, ilike } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-slack-signature');
    const timestamp = req.headers.get('x-slack-request-timestamp');

    // 1. Verify Slack Signature
    const isValid = verifySlackSignature({
      signature,
      timestamp,
      rawBody,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // 2. Handle Slack URL Verification Challenge
    if (payload.type === 'url_verification') {
      return NextResponse.json({ challenge: payload.challenge });
    }

    // 3. Handle Events Callback
    if (payload.type === 'event_callback' && payload.event) {
      const event = payload.event;

      // Ignore messages from bots or message-changed updates to avoid loops
      if (
        event.bot_id ||
        event.subtype === 'bot_message' ||
        event.subtype === 'message_changed' ||
        event.subtype === 'message_deleted'
      ) {
        return NextResponse.json({ ok: true });
      }

      const channel = event.channel;
      const slackUser = event.user;
      const text = (event.text || '').trim();

      if (!slackUser) {
        return NextResponse.json({ ok: true });
      }

      // Check if user is sending an account linking code (e.g. "FT-123456" or "link FT-123456")
      const linkCodeMatch = text.match(/FT-\d{6}/i);
      if (linkCodeMatch) {
        const inputCode = linkCodeMatch[0].toUpperCase();
        const foundLink = await db
          .select()
          .from(slackLinks)
          .where(eq(slackLinks.linkCode, inputCode))
          .limit(1);

        if (foundLink.length > 0) {
          const target = foundLink[0];
          await db
            .update(slackLinks)
            .set({
              slackUserId: slackUser,
              linkCode: null,
              linkedAt: new Date(),
              pendingDump: null,
            })
            .where(eq(slackLinks.id, target.id));

          await sendSlackMessage({
            channel,
            text: `🎉 *Account Linked!*\nYour Slack account is now connected to Fin-Twin. You can now send me text or voice notes anytime describing your expenses or income (e.g. _"Spent 45 on groceries"_ or _"Lent 20 to Sarah"_), and I'll parse them for your dashboard.`,
          });
          return NextResponse.json({ ok: true });
        } else {
          await sendSlackMessage({
            channel,
            text: `⚠️ *Code not recognized.* That link code is invalid or has already been used. Please generate a fresh code in your Fin-Twin *Settings* page and send it here.`,
          });
          return NextResponse.json({ ok: true });
        }
      }

      // Look up existing link for this Slack user
      const userLink = await db
        .select()
        .from(slackLinks)
        .where(eq(slackLinks.slackUserId, slackUser))
        .limit(1);

      if (userLink.length === 0 || !userLink[0].userId) {
        await sendSlackMessage({
          channel,
          text: `👋 *Welcome to Fin-Twin!*\nYour Slack account isn't linked to a Fin-Twin profile yet.\n\nTo connect:\n1. Open your Fin-Twin dashboard\n2. Go to *Settings* and click *Connect Slack*\n3. Send the generated code (e.g. \`FT-123456\`) here.`,
        });
        return NextResponse.json({ ok: true });
      }

      const link = userLink[0];
      const userId = link.userId;

      // Handle confirmation of pending transactions: "yes" / "save" / "confirm"
      const lower = text.toLowerCase();
      if (['yes', 'y', 'save', 'confirm', 'done', 'ok', 'okay'].includes(lower)) {
        if (!link.pendingDump) {
          await sendSlackMessage({
            channel,
            text: `No pending transactions to save. Send me an expense note (e.g. _"Paid 35 for dinner"_) to get started!`,
          });
          return NextResponse.json({ ok: true });
        }

        try {
          const pendingEntries: ValidatedEntry[] = JSON.parse(link.pendingDump);
          await saveEntriesToDatabase(userId, pendingEntries);

          await db
            .update(slackLinks)
            .set({ pendingDump: null })
            .where(eq(slackLinks.id, link.id));

          const summaryLines = pendingEntries.map((e) => {
            const personStr = e.personName ? ` · ${e.personName}` : '';
            return `• *${e.direction.toUpperCase()}* $${e.amount.toFixed(2)} (${e.categoryName}${personStr}) — _${e.note}_`;
          });

          await sendSlackMessage({
            channel,
            text: `✅ *Saved to your dashboard!*\n${summaryLines.join('\n')}\n\nYou can view the updated totals in your Fin-Twin dashboard.`,
          });
        } catch (e: any) {
          await sendSlackMessage({
            channel,
            text: `⚠️ Error saving transactions: ${e?.message || 'Unknown error'}`,
          });
        }
        return NextResponse.json({ ok: true });
      }

      // Handle cancel / discard: "cancel", "no", "discard"
      if (['no', 'cancel', 'discard', 'stop'].includes(lower)) {
        await db
          .update(slackLinks)
          .set({ pendingDump: null })
          .where(eq(slackLinks.id, link.id));

        await sendSlackMessage({
          channel,
          text: `❌ *Canceled.* The pending transaction was discarded.`,
        });
        return NextResponse.json({ ok: true });
      }

      // Check if message has voice/audio attachment
      let dumpText = text;
      const audioFile = event.files?.find(
        (f: any) =>
          f.mimetype?.startsWith('audio/') ||
          /\.(mp3|ogg|oga|wav|m4a|webm)$/i.test(f.name || '')
      );

      if (audioFile && audioFile.url_private_download) {
        try {
          await sendSlackMessage({
            channel,
            text: `🎙️ Transcribing voice note...`,
          });

          const audioBuffer = await downloadSlackFile(audioFile.url_private_download);
          const transcribed = await transcribeAudio({
            audioBuffer,
            filename: audioFile.name || 'voice.ogg',
          });

          if (transcribed && transcribed.trim()) {
            dumpText = transcribed.trim();
            await sendSlackMessage({
              channel,
              text: `🎙️ Heard: _"${dumpText}"_`,
            });
          }
        } catch (err: any) {
          await sendSlackMessage({
            channel,
            text: `⚠️ Voice transcription error: ${err?.message || 'Could not transcribe audio'}. You can also type your expense as text.`,
          });
          return NextResponse.json({ ok: true });
        }
      }

      if (!dumpText) {
        return NextResponse.json({ ok: true });
      }

      // Fetch user's known categories
      const dbCategories = await db
        .select({ name: categories.name })
        .from(categories)
        .where(or(isNull(categories.userId), eq(categories.userId, userId)));
      const knownCategories = dbCategories.map((c) => c.name);

      // Parse with core agent
      const parseResult = await parseDumpEntries({
        rawText: dumpText,
        knownCategories,
      });

      if (!parseResult.success || parseResult.entries.length === 0) {
        await sendSlackMessage({
          channel,
          text: `🤔 Couldn't parse any transactions from that message.\nTry something like: _"Spent 42.50 on groceries at Trader Joes"_ or _"Lent 20 to Sarah for coffee"_`,
        });
        return NextResponse.json({ ok: true });
      }

      // Save to pending dump for confirmation
      await db
        .update(slackLinks)
        .set({ pendingDump: JSON.stringify(parseResult.entries) })
        .where(eq(slackLinks.id, link.id));

      // Build confirmation message with Block Kit interactive buttons
      const entryLines = parseResult.entries.map((e) => {
        const personPart = e.personName ? ` · ${e.personName}` : '';
        return `• *${e.direction.toUpperCase()}* $${e.amount.toFixed(2)} · *${e.categoryName}*${personPart} · _${e.note}_`;
      });

      const blocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Got it:*\n${entryLines.join('\n')}\n\nReply *yes* to save, or tell me what's wrong.`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '✅ Confirm & Save',
                emoji: true,
              },
              style: 'primary',
              action_id: 'confirm_save',
              value: 'confirm_save',
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '❌ Cancel',
                emoji: true,
              },
              style: 'danger',
              action_id: 'cancel_dump',
              value: 'cancel_dump',
            },
          ],
        },
      ];

      await sendSlackMessage({
        channel,
        text: `Got it:\n${entryLines.join('\n')}\nReply *yes* to save, or click below:`,
        blocks,
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Slack Events API error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

async function saveEntriesToDatabase(userId: string, validatedEntries: ValidatedEntry[]) {
  // Fetch existing categories and people for reference
  const userCategories = await db
    .select()
    .from(categories)
    .where(or(isNull(categories.userId), eq(categories.userId, userId)));

  const userPeople = await db
    .select()
    .from(people)
    .where(eq(people.userId, userId));

  for (const entry of validatedEntries) {
    // Match category ID
    const matchedCategory = userCategories.find(
      (c) => c.name.toLowerCase() === entry.categoryName.toLowerCase()
    );
    const categoryId = matchedCategory?.id || null;

    // Match person ID for lend/borrow
    let personId: string | null = null;
    if (entry.personName && (entry.direction === 'lend' || entry.direction === 'borrow')) {
      const matchedPerson = userPeople.find((p) =>
        p.name.toLowerCase().includes(entry.personName!.toLowerCase())
      );
      if (matchedPerson) {
        personId = matchedPerson.id;
      }
    }

    let entryDate = new Date();
    if (entry.date) {
      const parsedD = new Date(entry.date);
      if (!isNaN(parsedD.getTime())) {
        entryDate = parsedD;
      }
    }

    await db.insert(entries).values({
      userId,
      amount: String(entry.amount),
      direction: entry.direction,
      categoryId,
      personId,
      date: entryDate,
      note: entry.note,
      status: entry.direction === 'lend' ? 'open' : null,
    });
  }
}
