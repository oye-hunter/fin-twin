import { NextRequest, NextResponse } from 'next/server';
import { db, people } from '@fin-twin/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ people: [] });
    }

    const list = await db.select().from(people).where(eq(people.userId, userId));
    return NextResponse.json({ people: list });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch people' }, { status: 500 });
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

    const { name, email, phone } = await req.json();
    if (!name || !name.trim() || !email || !email.trim()) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const [created] = await db
      .insert(people)
      .values({
        userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
      })
      .returning();

    return NextResponse.json({ person: created });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create person' }, { status: 500 });
  }
}
