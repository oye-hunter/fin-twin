import { NextRequest, NextResponse } from 'next/server';
import { db, categories } from '@fin-twin/db';
import { parseDumpEntries } from '@fin-twin/core';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { isNull, or, eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    const { text } = await req.json();

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    // Fetch known categories
    const condition = userId
      ? or(isNull(categories.userId), eq(categories.userId, userId))
      : isNull(categories.userId);

    const dbCategories = await db.select({ name: categories.name }).from(categories).where(condition);
    const knownCategories = dbCategories.map((c) => c.name);

    const result = await parseDumpEntries({
      rawText: text.trim(),
      knownCategories,
      apiKey: process.env.GROQ_KEY || process.env.GROQ_API_KEY,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to parse text' }, { status: 422 });
    }

    return NextResponse.json({ entries: result.entries });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
