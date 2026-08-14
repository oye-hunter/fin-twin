export type EntryDirection = 'income' | 'expense' | 'lend' | 'borrow';

export interface RawParsedEntry {
  amount: number;
  direction: EntryDirection;
  categoryName?: string | null;
  personName?: string | null;
  date?: string | null;
  note?: string | null;
}

export interface ValidatedEntry {
  amount: number;
  direction: EntryDirection;
  categoryName: string;
  personName: string | null;
  date: string;
  note: string;
}

export interface ParseDumpResult {
  success: boolean;
  entries: ValidatedEntry[];
  rawText: string;
  error?: string;
}
