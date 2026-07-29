
import { z } from 'zod'

export const QuizSubmissionSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().uuid('Invalid question ID'),
    selectedOptionId: z.string().uuid('Invalid option ID'),
  })).min(1, 'At least one answer is required'),
}).openapi('quizSubmissionSchema')

export const QuizSettingsSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  passMark: z.number().int().min(0).max(100).optional(),
  attemptLimit: z.number().int().min(1).max(10).optional(),
}).openapi('quizSettingsSchema')

export const QuizQuestionInputSchema = z.object({
  prompt: z.string().trim().min(1).max(1000),
  explanation: z.string().trim().max(1000).optional(),
  options: z.array(z.object({
    label: z.string().trim().min(1).max(255),
    isCorrect: z.boolean(),
  })).min(2).max(10),
}).openapi('quizQuestionInputSchema')
