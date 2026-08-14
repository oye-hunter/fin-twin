'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  HandCoins,
  Send,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';
import { useSession } from '@/lib/auth-client';
import Link from 'next/link';

interface DashboardState {
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
  isGuest?: boolean;
}

export default function DashboardPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const [data, setData] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [session]);

  const handleSendReminder = async (entryId: string, personName: string | null) => {
    setSendingReminderId(entryId);
    setReminderMessage(null);

    try {
      const res = await fetch('/api/reminders/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId }),
      });
      const resJson = await res.json();

      if (!res.ok) {
        throw new Error(resJson.error || 'Failed to send reminder');
      }

      setReminderMessage(`Reminder sent to ${personName || 'contact'} successfully!`);
      fetchDashboard();
    } catch (err: any) {
      setReminderMessage(err?.message || 'Error sending reminder email');
    } finally {
      setSendingReminderId(null);
    }
  };

  if (sessionPending || loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-ink/40" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Top Welcome / Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-ink/40">
            {data?.currentMonthName || 'Current Month'} Overview
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-ink mt-1">
            Financial Dashboard
          </h1>
        </div>

        <Link href="/dump">
          <Button variant="primary" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Dump Transaction
          </Button>
        </Link>
      </div>

      {reminderMessage && (
        <div className="p-4 rounded-[12px] bg-paper border border-ink/10 text-xs font-medium text-ink flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          {reminderMessage}
        </div>
      )}

      {/* 4 Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <Card variant="paper" className="p-6">
          <div className="flex items-center justify-between text-xs text-ink/60 mb-2 font-medium">
            <span>Expenses</span>
            <TrendingDown className="w-4 h-4 text-ink/40" />
          </div>
          <div className="text-2xl font-bold text-ink tracking-tight">
            ${(data?.totalExpense || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-ink/40 mt-1 block">In {data?.currentMonthName}</span>
        </Card>

        {/* Total Income */}
        <Card variant="paper" className="p-6">
          <div className="flex items-center justify-between text-xs text-ink/60 mb-2 font-medium">
            <span>Income</span>
            <TrendingUp className="w-4 h-4 text-ink/40" />
          </div>
          <div className="text-2xl font-bold text-ink tracking-tight">
            ${(data?.totalIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-ink/40 mt-1 block">In {data?.currentMonthName}</span>
        </Card>

        {/* Net Balance */}
        <Card variant="linen" className="p-6">
          <div className="flex items-center justify-between text-xs text-ink/60 mb-2 font-medium">
            <span>Net Balance</span>
            <Wallet className="w-4 h-4 text-ink/40" />
          </div>
          <div className={`text-2xl font-bold tracking-tight ${(data?.netSavings || 0) >= 0 ? 'text-ink' : 'text-red-700'}`}>
            ${(data?.netSavings || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-ink/40 mt-1 block">Income minus expenses</span>
        </Card>

        {/* Money Owed To You */}
        <Card variant="paper" className="p-6 border-honey/50 bg-amber-50/20">
          <div className="flex items-center justify-between text-xs text-ink/60 mb-2 font-medium">
            <span>Money Owed To You</span>
            <HandCoins className="w-4 h-4 text-ink/60" />
          </div>
          <div className="text-2xl font-bold text-ink tracking-tight">
            ${(data?.totalOwedToYou || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-ink/40 mt-1 block">
            {data?.openLends?.length || 0} active lent {data?.openLends?.length === 1 ? 'entry' : 'entries'}
          </span>
        </Card>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card variant="paper" className="p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-ink">Category Breakdown</h3>
            <p className="text-xs text-ink/60 mt-0.5">
              Expenses distributed across categories this month
            </p>
          </div>

          {(!data?.categoryBreakdown || data.categoryBreakdown.length === 0) ? (
            <div className="h-48 flex items-center justify-center text-xs text-ink/40 border border-dashed border-ink/10 rounded-[8px]">
              No expense categories recorded this month yet.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.categoryBreakdown}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#121718' }} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#121718' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(18,23,24,0.08)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="amount" fill="#121718" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Daily Spending Trend */}
        <Card variant="paper" className="p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-ink">Spending Trend</h3>
            <p className="text-xs text-ink/60 mt-0.5">
              Daily expense accumulation over the current month
            </p>
          </div>

          {(!data?.dailyTrends || data.dailyTrends.length === 0) ? (
            <div className="h-48 flex items-center justify-center text-xs text-ink/40 border border-dashed border-ink/10 rounded-[8px]">
              No daily trends to show for this month.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.dailyTrends} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#121718' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#121718' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(18,23,24,0.08)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#121718"
                    strokeWidth={2}
                    dot={{ fill: '#ffcd6d', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Money Owed To You (Lending Tracker) & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Lends */}
        <Card variant="paper" className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-ink">Money Owed to You</h3>
              <p className="text-xs text-ink/60 mt-0.5">
                Send transactional email reminders to settled debtors
              </p>
            </div>
            <Badge variant="apricot" className="text-xs">
              {data?.openLends?.length || 0} Open
            </Badge>
          </div>

          {(!data?.openLends || data.openLends.length === 0) ? (
            <div className="py-12 text-center text-xs text-ink/40 border border-dashed border-ink/10 rounded-[8px]">
              No active debts or lent money recorded.
            </div>
          ) : (
            <div className="space-y-3">
              {data.openLends.map((lend) => (
                <div
                  key={lend.id}
                  className="p-4 rounded-[12px] bg-linen border border-ink/8 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-ink">
                        {lend.personName || 'Unnamed contact'}
                      </span>
                      <span className="text-xs font-bold text-ink bg-amber-100/60 px-2 py-0.5 rounded-[6px]">
                        ${lend.amount.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-ink/60 mt-1">
                      {lend.note || 'Lent money'} &middot; {lend.date}
                    </p>
                    {lend.reminderSentAt && (
                      <span className="text-[10px] text-ink/50 mt-1 block">
                        Last reminded:{' '}
                        {new Date(lend.reminderSentAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    disabled={sendingReminderId === lend.id || !lend.personEmail}
                    onClick={() => handleSendReminder(lend.id, lend.personName)}
                    className="flex items-center gap-1.5 shrink-0 text-xs px-3 py-1.5"
                    title={!lend.personEmail ? 'No email attached' : 'Send email reminder'}
                  >
                    {sendingReminderId === lend.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    Send Reminder
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Transactions */}
        <Card variant="paper" className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-ink">Recent Entries</h3>
              <p className="text-xs text-ink/60 mt-0.5">
                Latest money movements recorded
              </p>
            </div>
            <Link href="/dump" className="text-xs font-semibold text-ink underline">
              + New Entry
            </Link>
          </div>

          {(!data?.recentEntries || data.recentEntries.length === 0) ? (
            <div className="py-12 text-center text-xs text-ink/40 border border-dashed border-ink/10 rounded-[8px]">
              No transactions recorded yet. Try the AI Dump!
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentEntries.map((entry) => {
                const isIncome = entry.direction === 'income';
                return (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-[12px] bg-linen/70 border border-ink/8 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isIncome ? 'bg-green-100 text-green-800' : 'bg-parchment text-ink'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-ink">
                          {entry.note || entry.categoryName}
                        </div>
                        <div className="text-[11px] text-ink/50 flex items-center gap-2 mt-0.5">
                          <span>{entry.categoryName}</span>
                          <span>&middot;</span>
                          <span>{entry.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`font-bold text-sm ${isIncome ? 'text-green-700' : 'text-ink'}`}>
                      {isIncome ? '+' : '-'}${entry.amount.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
