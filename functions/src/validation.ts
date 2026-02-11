/**
 * Request body validation for /api/* using Zod.
 * Rejects oversized or invalid payloads before business logic.
 */

import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { AI_PROMPT_MAX_LENGTH } from './constants';

const optionalModel = z.enum(['llama', 'mistral']).optional();
const stringMaxPrompt = z.string().trim().min(1).max(AI_PROMPT_MAX_LENGTH);

const curriculumContextSchema = z.object({
  curriculumType: z.string().optional(),
  board: z.string().optional(),
  grade: z.string().optional(),
  exam: z.string().optional(),
  subject: z.string().optional(),
  topic: z.string().optional(),
}).optional();

export const resolveDoubtSchema = z.object({
  question: stringMaxPrompt,
  context: z.string().trim().max(5000).optional(),
  curriculumContext: curriculumContextSchema,
  model: optionalModel,
});

export const generateContentSchema = z.object({
  prompt: stringMaxPrompt,
  model: optionalModel,
});

export const generateTeachingContentSchema = z.object({
  topic: z.string().trim().max(500).optional(),
  prompt: z.string().trim().max(AI_PROMPT_MAX_LENGTH).optional(),
  curriculumContext: curriculumContextSchema,
  model: optionalModel,
}).refine(data => data.topic || data.prompt, {
  message: "Either topic or prompt must be provided",
  path: ["topic"],
});

export const generateQuizSchema = z.object({
  topic: z.string().trim().min(1).max(500),
  context: z.string().trim().max(5000).optional(),
  curriculumContext: curriculumContextSchema,
  model: optionalModel,
});

type Schema = z.ZodType<unknown>;

export function validateBody(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (result.success) {
      req.body = result.data;
      next();
      return;
    }
    const first = result.error.errors[0];
    const message = first?.message ?? 'Validation failed';
    res.status(400).json({ error: message, code: 'VALIDATION' });
  };
}
