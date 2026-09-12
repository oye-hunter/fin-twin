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

export const dumpJsonSchema = {
  type: 'object',
  properties: {
    entries: {
      type: 'array',
      description: 'List of parsed financial transactions.',
      items: {
        type: 'object',
        properties: {
          amount: {
            type: 'number',
            description: 'Positive monetary amount spent, received, lent, or borrowed.',
          },
          direction: {
            type: 'string',
            enum: ['income', 'expense', 'lend', 'borrow'],
            description: 'Direction of money movement.',
          },
          categoryName: {
            type: ['string', 'null'],
            description: 'Matched category from known categories list, or null if unsure or not in the list.',
          },
          personName: {
            type: ['string', 'null'],
            description: 'Person name for lend or borrow transactions, or null.',
          },
          date: {
            type: ['string', 'null'],
            description: 'ISO date string (YYYY-MM-DD) if explicitly mentioned or relative to today, otherwise null.',
          },
          note: {
            type: ['string', 'null'],
            description: 'Brief summary description of this transaction.',
          },
        },
        required: ['amount', 'direction', 'categoryName', 'personName', 'date', 'note'],
        additionalProperties: false,
      },
    },
  },
  required: ['entries'],
  additionalProperties: false,
} as const;

