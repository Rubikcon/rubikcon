
import { z } from 'zod'

export const AssignmentSubmissionSchema = z.object({
  choiceId: z.string().uuid('Invalid choice ID').nullish().transform(val => val || undefined),
  textResponse: z.string().trim().nullish().transform(val => val || undefined),
  attachmentName: z.string().trim().nullish().transform(val => val || undefined),
  attachmentUrl: z.string().url('Invalid attachment URL').nullish().transform(val => val || undefined),
  attachmentMimeType: z.string().trim().nullish().transform(val => val || undefined),
  attachmentSizeBytes: z.number().int().positive().max(10_000_000).nullish().transform(val => val || undefined),
}).superRefine((value, ctx) => {
  if (!value.textResponse && !value.attachmentUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Either a text response or an attachment must be provided.',
      path: ['textResponse'],
    })
  }
}).openapi('assignmentSubmissionSchema')

export const FeedbackSchema = z.object({
  feedback: z.string().trim().min(2).max(5000),
  rating: z.number().int().min(1).max(5).optional(),
}).openapi('feedbackSchema')

export const CreateAssignmentSchema = z.object({
  title: z.string().trim().min(1).max(255),
  instructions: z.string().trim().min(1).max(10000),
  deadline: z.string().datetime(),
  allowTextSubmission: z.boolean().default(true),
  allowFileUpload: z.boolean().default(false),
  position: z.number().int().positive().optional(),
  choices: z.array(z.object({
    title: z.string().trim().min(1).max(255),
    description: z.string().trim().max(1000).optional(),
    position: z.number().int().positive(),
  })).default([]),
}).openapi('createAssignmentSchema')
