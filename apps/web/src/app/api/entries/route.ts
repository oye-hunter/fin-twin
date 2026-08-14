import { NextRequest, NextResponse } from 'next/server';
import { db, entries, categories, people } from '@fin-twin/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, and, desc, sql, ilike, or } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ entries: [] });
    }

    const { searchParams } = new URL(req.url);
    const direction = searchParams.get('direction');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const conditions = [eq(entries.userId, userId)];

    if (direction && ['income', 'expense', 'lend', 'borrow'].includes(direction)) {
      conditions.push(eq(entries.direction, direction as any));
    }

    if (categoryId) {
      conditions.push(eq(entries.categoryId, categoryId));
    }

    if (status && ['open', 'settled'].includes(status)) {
      conditions.push(eq(entries.status, status as any));
    }

    if (search && search.trim()) {
      conditions.push(
        or(
          ilike(entries.note, `%${search.trim()}%`),
          ilike(people.name, `%${search.trim()}%`)
        )!
      );
    }

    const rows = await db
      .select({
        id: entries.id,
        amount: entries.amount,
        direction: entries.direction,
        categoryId: entries.categoryId,
        categoryName: categories.name,
        personId: entries.personId,
        personName: people.name,
        personEmail: people.email,
        date: entries.date,
        note: entries.note,
        status: entries.status,
        reminderSentAt: entries.reminderSentAt,
        createdAt: entries.createdAt,
      })
      .from(entries)
      .leftJoin(categories, eq(entries.categoryId, categories.id))
      .leftJoin(people, eq(entries.personId, people.id))
      .where(and(...conditions))
      .orderBy(desc(entries.date));

    const formatted = rows.map((r) => ({
      ...r,
      amount: Number(r.amount),
      date: new Date(r.date).toISOString().split('T')[0],
      createdAt: new Date(r.createdAt).toISOString(),
      reminderSentAt: r.reminderSentAt ? new Date(r.reminderSentAt).toISOString() : null,
    }));

    return NextResponse.json({ entries: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch entries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, direction, categoryId, personId, date, note, status } = await req.json();

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid positive amount is required' }, { status: 400 });
    }

    if (!direction || !['income', 'expense', 'lend', 'borrow'].includes(direction)) {
      return NextResponse.json({ error: 'Valid direction is required' }, { status: 400 });
    }

    const entryDate = date ? new Date(date) : new Date();
    const entryStatus = (direction === 'lend' || direction === 'borrow') ? (status || 'open') : null;

    const [created] = await db
      .insert(entries)
      .values({
        userId,
        amount: Number(amount).toFixed(2),
        direction,
        categoryId: categoryId || null,
        personId: personId || null,
        date: isNaN(entryDate.getTime()) ? new Date() : entryDate,
        note: note || null,
        status: entryStatus,
      })
      .returning();

    return NextResponse.json({ entry: created });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create entry' }, { status: 500 });
  }
}
