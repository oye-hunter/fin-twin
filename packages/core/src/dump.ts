import { z } from 'zod';

export const dumpEntrySchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  direction: z.enum(['income', 'expense', 'lend', 'borrow']).default('expense'),
  categoryName: z.string().nullable().optional(),
  personName: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
});

export const dumpPayloadSchema = z.object({
  entries: z.array(dumpEntrySchema).min(1, 'At least one transaction must be parsed'),
});

export type DumpPayload = z.infer<typeof dumpPayloadSchema>;
export type DumpEntry = z.infer<typeof dumpEntrySchema>;
