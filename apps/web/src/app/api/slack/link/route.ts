import { NextRequest, NextResponse } from 'next/server';
import { db, slackLinks } from '@fin-twin/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const existing = await db
      .select()
      .from(slackLinks)
      .where(eq(slackLinks.userId, userId))
      .limit(1);

    const link = existing[0];
    const isLinked = Boolean(link?.slackUserId);

    return NextResponse.json({
      isLinked,
      slackUserId: link?.slackUserId || null,
      linkCode: link?.linkCode || null,
      linkedAt: link?.linkedAt || null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    // Generate a clean, human-readable 6-character linking code
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const linkCode = `FT-${randomDigits}`;

    const existing = await db
      .select()
      .from(slackLinks)
      .where(eq(slackLinks.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(slackLinks)
        .set({
          linkCode,
          linkedAt: null,
          slackUserId: null,
          pendingDump: null,
        })
        .where(eq(slackLinks.userId, userId));
    } else {
      await db.insert(slackLinks).values({
        userId,
        linkCode,
      });
    }

    return NextResponse.json({
      success: true,
      linkCode,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    await db
      .update(slackLinks)
      .set({
        slackUserId: null,
        linkCode: null,
        linkedAt: null,
        pendingDump: null,
      })
      .where(eq(slackLinks.userId, userId));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
