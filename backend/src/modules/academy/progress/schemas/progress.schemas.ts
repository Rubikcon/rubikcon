import { z } from 'zod'

export const SubmitLegacyProgressSchema = z.object({
  lessonId: z.string().uuid('Invalid lesson ID'),
  completed: z.boolean().default(true),
}).openapi('SubmitLegacyProgressSchema', { description: 'Payload for submitting legacy progress' })

export const SubmitRatingSchema = z.object({
  rating: z.number().int().min(1).max(5),
}).openapi('SubmitRatingSchema', { description: 'Payload for submitting a rating' })

export const AdminWeekFilterSchema = z.object({
  weekSlug: z.string().optional(),
}).openapi('AdminWeekFilterSchema', { description: 'Filter for admin weeks' })

export const SaveGlossaryTermSchema = z.object({
  termId: z.string().uuid('Invalid term ID'),
}).openapi('SaveGlossaryTermSchema', { description: 'Payload for saving a glossary term' })
