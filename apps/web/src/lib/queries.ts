import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface EntryFilterParams {
  direction?: string;
  categoryId?: string;
  search?: string;
  status?: string;
}

export interface EntryItem {
  id: string;
  amount: number;
  direction: 'income' | 'expense' | 'lend' | 'borrow';
  categoryId: string | null;
  categoryName: string | null;
  personId: string | null;
  personName: string | null;
  personEmail: string | null;
  date: string;
  note: string | null;
  status: 'open' | 'settled' | null;
  reminderSentAt: string | null;
  createdAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  isPredefined: boolean;
  userId: string | null;
}

export interface PersonItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

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
  isGuest?: boolean;
}

// 1. Dashboard Query
export function useDashboardData() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      return res.json();
    },
  });
}

// 2. Entries Queries & Mutations
export function useEntries(filters?: EntryFilterParams) {
  const queryParams = new URLSearchParams();
  if (filters?.direction && filters.direction !== 'all') queryParams.set('direction', filters.direction);
  if (filters?.categoryId && filters.categoryId !== 'all') queryParams.set('categoryId', filters.categoryId);
  if (filters?.status && filters.status !== 'all') queryParams.set('status', filters.status);
  if (filters?.search) queryParams.set('search', filters.search);

  const queryString = queryParams.toString();
  const url = `/api/entries${queryString ? `?${queryString}` : ''}`;

  return useQuery<{ entries: EntryItem[] }>({
    queryKey: ['entries', filters],
    queryFn: async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch entries');
      return res.json();
    },
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newEntry: Partial<EntryItem>) => {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create entry');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EntryItem> }) => {
      const res = await fetch(`/api/entries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update entry');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete entry');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// 3. Categories Queries & Mutations
export function useCategories() {
  return useQuery<{ categories: CategoryItem[] }>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create category');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// 4. People Queries & Mutations
export function usePeople() {
  return useQuery<{ people: PersonItem[] }>({
    queryKey: ['people'],
    queryFn: async () => {
      const res = await fetch('/api/people');
      if (!res.ok) throw new Error('Failed to fetch people');
      return res.json();
    },
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (person: { name: string; email: string; phone?: string | null }) => {
      const res = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(person),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create contact');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
    },
  });
}

// 5. Reminders
export function useSendReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entryId: string) => {
      const res = await fetch('/api/reminders/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to send reminder email');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
    },
  });
}
