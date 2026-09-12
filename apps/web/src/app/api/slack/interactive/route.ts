import { NextRequest, NextResponse } from 'next/server';
import { db, slackLinks, entries, categories, people } from '@fin-twin/db';
import { updateSlackMessage, verifySlackSignature } from '@/lib/slack';
import { eq, or, isNull } from 'drizzle-orm';
import type { ValidatedEntry } from '@fin-twin/core';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-slack-signature');
    const timestamp = req.headers.get('x-slack-request-timestamp');

    // Verify signature
    const isValid = verifySlackSignature({
      signature,
      timestamp,
      rawBody,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Slack sends interactive payloads as urlencoded form data with 'payload' key
    const params = new URLSearchParams(rawBody);
    const payloadJson = params.get('payload');
    if (!payloadJson) {
      return NextResponse.json({ error: 'Missing payload' }, { status: 400 });
    }

    const payload = JSON.parse(payloadJson);
    const action = payload.actions?.[0]?.action_id;
    const slackUser = payload.user?.id;
    const channel = payload.channel?.id;
    const messageTs = payload.message?.ts;

    if (!slackUser || !action || !channel || !messageTs) {
      return NextResponse.json({ ok: true });
    }

    const userLink = await db
      .select()
      .from(slackLinks)
      .where(eq(slackLinks.slackUserId, slackUser))
      .limit(1);

    if (userLink.length === 0) {
      return NextResponse.json({ ok: true });
    }

    const link = userLink[0];

    if (action === 'confirm_save') {
      if (link.pendingDump) {
        const pendingEntries: ValidatedEntry[] = JSON.parse(link.pendingDump);
        await saveEntries(link.userId, pendingEntries);

        await db
          .update(slackLinks)
          .set({ pendingDump: null })
          .where(eq(slackLinks.id, link.id));

        const summary = pendingEntries
          .map((e) => `• *${e.direction.toUpperCase()}* $${e.amount.toFixed(2)} (${e.categoryName}) — _${e.note}_`)
          .join('\n');

        await updateSlackMessage({
          channel,
          ts: messageTs,
          text: `✅ *Saved to Fin-Twin!*\n${summary}\n_Saved to your dashboard._`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `✅ *Saved to Fin-Twin!*\n${summary}`,
              },
            },
          ],
        });
      }
    } else if (action === 'cancel_dump') {
      await db
        .update(slackLinks)
        .set({ pendingDump: null })
        .where(eq(slackLinks.id, link.id));

      await updateSlackMessage({
        channel,
        ts: messageTs,
        text: `❌ *Canceled.* The transaction was discarded.`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `❌ *Canceled.* The transaction was discarded.`,
            },
          },
        ],
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Slack interactive error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

async function saveEntries(userId: string, validatedEntries: ValidatedEntry[]) {
  const userCategories = await db
    .select()
    .from(categories)
    .where(or(isNull(categories.userId), eq(categories.userId, userId)));

  const userPeople = await db
    .select()
    .from(people)
    .where(eq(people.userId, userId));

  for (const entry of validatedEntries) {
    const matchedCategory = userCategories.find(
      (c) => c.name.toLowerCase() === entry.categoryName.toLowerCase()
    );
    const categoryId = matchedCategory?.id || null;

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
