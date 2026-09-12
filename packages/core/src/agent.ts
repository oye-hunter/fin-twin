import Groq, { toFile } from 'groq-sdk';
import { dumpPayloadSchema, dumpJsonSchema } from './dump';
import { matchCategory } from './categories';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompt';
import type { ParseDumpResult, ValidatedEntry } from './types';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

export function groqModel(): string {
  return process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
}

export interface ParseOptions {
  rawText: string;
  knownCategories: string[];
  apiKey?: string;
  model?: string;
}

export async function parseDumpEntries(options: ParseOptions): Promise<ParseDumpResult> {
  const {
    rawText,
    knownCategories,
    apiKey = process.env.GROQ_KEY || process.env.GROQ_API_KEY,
    model = groqModel(),
  } = options;

  if (!rawText || !rawText.trim()) {
    return {
      success: false,
      entries: [],
      rawText,
      error: 'Input text is empty',
    };
  }

  if (!apiKey) {
    return {
      success: false,
      entries: [],
      rawText,
      error: 'Groq API Key is not configured',
    };
  }

  const groq = new Groq({ apiKey });
  const userPrompt = buildUserPrompt(rawText, knownCategories);
  const todayISO = new Date().toISOString();

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const response = await groq.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'dump_payload',
            strict: true,
            schema: dumpJsonSchema,
          },
        } as any,
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from Groq');
      }

      const jsonParsed = JSON.parse(content);
      const validatedPayload = dumpPayloadSchema.parse(jsonParsed);

      const normalizedEntries: ValidatedEntry[] = validatedPayload.entries.map((item) => {
        const cat = matchCategory(item.categoryName, knownCategories);
        let entryDate = todayISO;
        if (item.date) {
          const parsedD = new Date(item.date);
          if (!isNaN(parsedD.getTime())) {
            entryDate = parsedD.toISOString();
          }
        }

        return {
          amount: Number(item.amount),
          direction: item.direction,
          categoryName: cat,
          personName: item.personName?.trim() || null,
          date: entryDate,
          note: item.note?.trim() || rawText.trim(),
        };
      });

      return {
        success: true,
        entries: normalizedEntries,
        rawText,
      };
    } catch (err: any) {
      if (attempts >= maxAttempts) {
        return {
          success: false,
          entries: [],
          rawText,
          error: err?.message || 'Failed to parse transactions with AI',
        };
      }
    }
  }

  return {
    success: false,
    entries: [],
    rawText,
    error: 'Parsing failed after retries',
  };
}

export interface TranscribeOptions {
  audioBuffer: Buffer;
  filename?: string;
  mimeType?: string;
  apiKey?: string;
  model?: string;
}

export async function transcribeAudio(options: TranscribeOptions): Promise<string> {
  const {
    audioBuffer,
    filename = 'audio.mp3',
    apiKey = process.env.GROQ_KEY || process.env.GROQ_API_KEY,
    model = 'whisper-large-v3-turbo',
  } = options;

  if (!apiKey) {
    throw new Error('Groq API Key is not configured for audio transcription');
  }

  const groq = new Groq({ apiKey });
  const file = await toFile(audioBuffer, filename);
  const response = await groq.audio.transcriptions.create({
    file,
    model,
  });

  return response.text;
}

