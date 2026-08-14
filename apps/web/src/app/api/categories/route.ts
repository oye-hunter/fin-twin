import { NextRequest, NextResponse } from 'next/server';
import { db, categories } from '@fin-twin/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { isNull, or, eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;

    const condition = userId
      ? or(isNull(categories.userId), eq(categories.userId, userId))
      : isNull(categories.userId);

    const list = await db.select().from(categories).where(condition);
    return NextResponse.json({ categories: list });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch categories' }, { status: 500 });
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

    const { name } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const [created] = await db
      .insert(categories)
      .values({
        name: name.trim(),
        userId,
        isPredefined: false,
      })
      .returning();

    return NextResponse.json({ category: created });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create category' }, { status: 500 });
  }
}
