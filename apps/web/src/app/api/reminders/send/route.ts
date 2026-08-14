import { NextRequest, NextResponse } from 'next/server';
import { db, entries, people } from '@fin-twin/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, and } from 'drizzle-orm';
import { sendReminderEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entryId } = await req.json();
    if (!entryId) {
      return NextResponse.json({ error: 'entryId is required' }, { status: 400 });
    }

    // Fetch entry with attached person
    const [entry] = await db
      .select({
        id: entries.id,
        amount: entries.amount,
        note: entries.note,
        status: entries.status,
        personId: entries.personId,
        personName: people.name,
        personEmail: people.email,
      })
      .from(entries)
      .leftJoin(people, eq(entries.personId, people.id))
      .where(and(eq(entries.id, entryId), eq(entries.userId, userId)));

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    if (!entry.personEmail) {
      return NextResponse.json(
        { error: 'Cannot send reminder: No contact email attached to this entry' },
        { status: 400 }
      );
    }

    const sendRes = await sendReminderEmail({
      toEmail: entry.personEmail,
      recipientName: entry.personName || 'Friend',
      amount: entry.amount,
      note: entry.note,
      senderName: session.user.name || 'Your friend',
    });

    if (!sendRes.success) {
      return NextResponse.json({ error: sendRes.error }, { status: 500 });
    }

    // Update reminderSentAt in DB
    const now = new Date();
    await db
      .update(entries)
      .set({ reminderSentAt: now })
      .where(eq(entries.id, entryId));

    return NextResponse.json({ success: true, sentAt: now.toISOString() });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to send reminder' }, { status: 500 });
  }
}
