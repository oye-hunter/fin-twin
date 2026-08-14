import { NextRequest, NextResponse } from 'next/server';
import { getDashboardAggregations } from '@/lib/aggregations';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({
        currentMonthName: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        totalIncome: 0,
        totalExpense: 0,
        netSavings: 0,
        totalOwedToYou: 0,
        categoryBreakdown: [],
        dailyTrends: [],
        openLends: [],
        recentEntries: [],
        isGuest: true,
      });
    }

    const data = await getDashboardAggregations(userId);
    return NextResponse.json({ ...data, isGuest: false });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to aggregate dashboard data' }, { status: 500 });
  }
}
