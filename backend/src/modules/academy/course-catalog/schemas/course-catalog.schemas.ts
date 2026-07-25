import { z } from 'zod'

export const ContactSchema = z.object({
  fullName: z.string().trim().min(2).max(200),
  email: z.string().trim().email(),
  subject: z.enum([
    'General Enquiry',
    'Enrolment Question',
    'Partnership or Collaboration',
    'Funded Cohort Request',
    'Media or Press',
  ]),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(0).optional(), // honeypot — must stay empty
}).openapi('contactSchema')

export const CreateCourseSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(5000),
  tagline: z.string().trim().max(300).optional(),
  level: z.string().trim().max(100).optional(),
  estimatedDuration: z.string().trim().max(100).optional(),
  phaseLabel: z.string().trim().max(100).optional(),
  heroImage: z.string().url().optional(),
  introVideoUrl: z.string().url().optional(),
  overviewSlideUrl: z.string().url().optional().nullable(),
  contentUnit: z.enum(['Lesson', 'Week', 'Module', 'Session', 'Chapter', 'Unit']).default('Lesson').optional(),
  isPaid: z.boolean().default(false).optional(),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').min(3).max(100),
}).openapi('createCourseSchema')

export const UpdateCourseSchema = CreateCourseSchema.partial()

export const CoursePricingSchema = z.object({
  priceUsd: z.number().min(0).max(1_000_000).nullable().optional(),
  priceNgn: z.number().min(0).max(1_000_000_000).nullable().optional(),
  discountPercent: z.number().int().min(0).max(100).nullable().optional(),
}).openapi('coursePricingSchema')

export const CreateWeekSchema = z.object({
  number: z.number().int().min(1),
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').min(3).max(100),
  durationLabel: z.string().trim().min(1).max(100).default('30 min'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  hook: z.string().trim().min(1).max(500).default('Hook coming soon.'),
  whatToExpect: z.string().trim().min(1).max(2000).default('Details coming soon.'),
  summary: z.string().trim().min(1).max(5000).default('Summary coming soon.'),
  estimatedCompletionMinutes: z.number().int().min(1).max(600).default(30),
  moduleId: z.string().uuid().optional().nullable(),
  videoTitle: z.string().trim().max(200).optional(),
  videoUrl: z.string().url().optional(),
  lessonContent: z.string().trim().max(50000).optional(),
  topics: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
  objectives: z.array(z.string().trim().min(1).max(500)).max(20).default([]),
}).openapi('createWeekSchema')

export const UpdateWeekSchema = CreateWeekSchema.partial()

export const CreateModuleSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional(),
  introVideoUrl: z.string().url().optional().nullable(),
}).openapi('createModuleSchema')

export const UpdateModuleSchema = CreateModuleSchema.partial()

export const CreateLessonSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().max(50000).optional(),
  videoUrl: z.string().url().optional().nullable(),
}).openapi('createLessonSchema')

export const UpdateLessonSchema = CreateLessonSchema.partial()

export const UpdateWeekContentSchema = z.object({
  lessonContent: z.string().trim().max(50000)
}).openapi('updateWeekContentSchema')

export const CreateWeekImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  alt: z.string().trim().max(500).optional(),
  caption: z.string().trim().max(500).optional(),
}).openapi('createWeekImageSchema')

export const CreateWeekVideoSchema = z.object({
  title: z.string().trim().min(1).max(200),
  url: z.string().url('Invalid video URL'),
  description: z.string().trim().max(1000).optional(),
}).openapi('createWeekVideoSchema')

export const UpdateWeekVideoSchema = CreateWeekVideoSchema.partial()

export const ReorderWeekVideosSchema = z.object({
  videoIds: z.array(z.string().uuid()).min(1).max(50),
}).openapi('reorderWeekVideosSchema')

export const AssignWeekFacilitatorSchema = z.object({
  facilitatorId: z.string().uuid()
}).openapi('assignWeekFacilitatorSchema')

export const GlossaryTermSchema = z.object({
  term: z.string().trim().min(1).max(200),
  definition: z.string().trim().min(1).max(2000),
  example: z.string().trim().max(2000).optional().nullable(),
}).openapi('glossaryTermSchema')

export const ReadingResourceSchema = z.object({
  title: z.string().trim().min(1).max(200),
  source: z.string().trim().min(1).max(200),
  url: z.string().url(),
  description: z.string().trim().max(2000).default(''),
  type: z.enum(['ARTICLE', 'COURSE', 'DOCUMENTATION', 'WHITEPAPER', 'VIDEO', 'INTERACTIVE']),
}).openapi('readingResourceSchema')

export const SlideDeckSchema = z.object({
  title: z.string().trim().min(1).max(200),
  url: z.string().url(),
  slideCount: z.number().int().min(1).max(500).default(1),
  viewerType: z.enum(['MODAL', 'EXTERNAL']).default('EXTERNAL'),
}).openapi('slideDeckSchema')
