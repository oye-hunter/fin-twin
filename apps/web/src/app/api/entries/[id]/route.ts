import { NextRequest, NextResponse } from 'next/server';
import { db, entries } from '@fin-twin/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const updatePayload: Record<string, any> = {};

    if (body.amount !== undefined) {
      const num = Number(body.amount);
      if (isNaN(num) || num <= 0) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
      }
      updatePayload.amount = num.toFixed(2);
    }

    if (body.direction !== undefined) {
      if (!['income', 'expense', 'lend', 'borrow'].includes(body.direction)) {
        return NextResponse.json({ error: 'Invalid direction' }, { status: 400 });
      }
      updatePayload.direction = body.direction;
    }

    if (body.categoryId !== undefined) {
      updatePayload.categoryId = body.categoryId || null;
    }

    if (body.personId !== undefined) {
      updatePayload.personId = body.personId || null;
    }

    if (body.date !== undefined) {
      const d = new Date(body.date);
      if (!isNaN(d.getTime())) {
        updatePayload.date = d;
      }
    }

    if (body.note !== undefined) {
      updatePayload.note = body.note;
    }

    if (body.status !== undefined) {
      if (body.status === null || ['open', 'settled'].includes(body.status)) {
        updatePayload.status = body.status;
      }
    }

    const [updated] = await db
      .update(entries)
      .set(updatePayload)
      .where(and(eq(entries.id, id), eq(entries.userId, userId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ entry: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update entry' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const [deleted] = await db
      .delete(entries)
      .where(and(eq(entries.id, id), eq(entries.userId, userId)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: deleted.id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete entry' }, { status: 500 });
  }
}
