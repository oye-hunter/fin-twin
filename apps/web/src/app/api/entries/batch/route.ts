import { NextRequest, NextResponse } from 'next/server';
import { db, entries, categories, people } from '@fin-twin/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, and, isNull, or } from 'drizzle-orm';

interface SaveEntryItem {
  amount: number;
  direction: 'income' | 'expense' | 'lend' | 'borrow';
  categoryId?: string | null;
  categoryName?: string | null;
  personId?: string | null;
  personName?: string | null;
  personEmail?: string | null;
  date?: string | null;
  note?: string | null;
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

    const { items }: { items: SaveEntryItem[] } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No entries provided' }, { status: 400 });
    }

    // Retrieve user categories to map names if ID not provided
    const userCategories = await db
      .select()
      .from(categories)
      .where(or(isNull(categories.userId), eq(categories.userId, userId)));

    const createdEntries = [];

    for (const item of items) {
      let resolvedCategoryId = item.categoryId;
      if (!resolvedCategoryId && item.categoryName) {
        const found = userCategories.find(
          (c) => c.name.toLowerCase() === item.categoryName?.toLowerCase()
        );
        resolvedCategoryId = found ? found.id : null;
      }

      let resolvedPersonId = item.personId;
      // If personId wasn't selected but a name was parsed for a lend entry, check if person exists
      if (!resolvedPersonId && item.personName && (item.direction === 'lend' || item.direction === 'borrow')) {
        const existingPerson = await db
          .select()
          .from(people)
          .where(and(eq(people.userId, userId), eq(people.name, item.personName.trim())))
          .limit(1);

        if (existingPerson.length > 0) {
          resolvedPersonId = existingPerson[0].id;
        }
      }

      const status = (item.direction === 'lend' || item.direction === 'borrow') ? 'open' : null;
      const entryDate = item.date ? new Date(item.date) : new Date();

      const [saved] = await db
        .insert(entries)
        .values({
          userId,
          amount: item.amount.toFixed(2),
          direction: item.direction,
          categoryId: resolvedCategoryId || null,
          personId: resolvedPersonId || null,
          date: isNaN(entryDate.getTime()) ? new Date() : entryDate,
          note: item.note || null,
          status,
        })
        .returning();

      createdEntries.push(saved);
    }

    return NextResponse.json({ count: createdEntries.length, entries: createdEntries });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to save entries' }, { status: 500 });
  }
}
