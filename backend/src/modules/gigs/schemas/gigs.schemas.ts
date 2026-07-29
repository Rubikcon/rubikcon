import { z } from 'zod'

export const CreateGigSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  budget: z.number().positive('Budget must be positive'),
  budgetType: z.enum(['FIXED', 'HOURLY']).default('FIXED'),
  currency: z.enum(['ETH', 'USDC', 'MATIC']).default('USDC'),
  category: z.string().min(1, 'Category is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  difficulty: z.enum(['ENTRY', 'MID', 'SENIOR']).default('MID'),
  deadline: z.string().min(1, 'Deadline is required'),
  remote: z.boolean().default(true),
}).openapi('createGigSchema')

export const ApplySchema = z.object({
  gigId: z.string().uuid('Invalid gig ID'),
  proposal: z.string().min(50, 'Proposal must be at least 50 characters'),
  rate: z.number().positive().optional(),
}).openapi('applySchema')
