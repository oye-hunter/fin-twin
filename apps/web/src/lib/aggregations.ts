import { db, entries, categories, people } from '@fin-twin/db';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export interface DashboardData {
  currentMonthName: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  totalOwedToYou: number;
  categoryBreakdown: { category: string; amount: number }[];
  dailyTrends: { date: string; amount: number }[];
  openLends: {
    id: string;
    amount: number;
    date: string;
    note: string | null;
    personName: string | null;
    personEmail: string | null;
    reminderSentAt: string | null;
  }[];
  recentEntries: {
    id: string;
    amount: number;
    direction: string;
    categoryName: string;
    date: string;
    note: string | null;
  }[];
}

export async function getDashboardAggregations(userId: string): Promise<DashboardData> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  // 1. Fetch all entries for this user
  const userEntries = await db
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
    .where(eq(entries.userId, userId))
    .orderBy(desc(entries.date));

  let totalIncome = 0;
  let totalExpense = 0;
  let totalOwedToYou = 0;
  const categoryMap = new Map<string, number>();
  const dailyMap = new Map<string, number>();

  const openLends: DashboardData['openLends'] = [];
  const recentEntries: DashboardData['recentEntries'] = [];

  for (const row of userEntries) {
    const amt = Number(row.amount);
    const rowDate = new Date(row.date);
    const inCurrentMonth = rowDate >= startOfMonth && rowDate <= endOfMonth;

    if (inCurrentMonth) {
      if (row.direction === 'expense') {
        totalExpense += amt;
        const catName = row.categoryName || 'Uncategorized';
        categoryMap.set(catName, (categoryMap.get(catName) || 0) + amt);

        const dayKey = rowDate.toISOString().split('T')[0];
        dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + amt);
      } else if (row.direction === 'income') {
        totalIncome += amt;
      }
    }

    if (row.direction === 'lend' && row.status === 'open') {
      totalOwedToYou += amt;
      openLends.push({
        id: row.id,
        amount: amt,
        date: rowDate.toISOString().split('T')[0],
        note: row.note,
        personName: row.personName,
        personEmail: row.personEmail,
        reminderSentAt: row.reminderSentAt ? new Date(row.reminderSentAt).toISOString() : null,
      });
    }

    if (recentEntries.length < 5) {
      recentEntries.push({
        id: row.id,
        amount: amt,
        direction: row.direction,
        categoryName: row.categoryName || 'Uncategorized',
        date: rowDate.toISOString().split('T')[0],
        note: row.note,
      });
    }
  }

  // Format category breakdown
  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({ category, amount: Number(amount.toFixed(2)) }))
    .sort((a, b) => b.amount - a.amount);

  // Format daily trends
  const dailyTrends = Array.from(dailyMap.entries())
    .map(([date, amount]) => ({ date, amount: Number(amount.toFixed(2)) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    currentMonthName: monthName,
    totalIncome: Number(totalIncome.toFixed(2)),
    totalExpense: Number(totalExpense.toFixed(2)),
    netSavings: Number((totalIncome - totalExpense).toFixed(2)),
    totalOwedToYou: Number(totalOwedToYou.toFixed(2)),
    categoryBreakdown,
    dailyTrends,
    openLends,
    recentEntries,
  };
}
