import { z } from 'zod'
import '@asteasolutions/zod-to-openapi'

export const UpdateRoleSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'FACILITATOR', 'USER'], { errorMap: () => ({ message: 'Invalid role' }) }),
}).openapi('UpdateRoleSchema', {
  title: 'Update Role',
  description: 'Payload for updating user role',
})

export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>

export const CreateFacilitatorSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().toLowerCase().max(255),
  title: z.string().trim().max(150).optional(),
  bio: z.string().trim().max(1000).optional(),
  photoUrl: z.string().url().optional(),
}).openapi('CreateFacilitatorSchema', {
  title: 'Create Facilitator',
  description: 'Payload for creating a facilitator',
})

export type CreateFacilitatorDto = z.infer<typeof CreateFacilitatorSchema>

export const UpdateFacilitatorSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().toLowerCase().max(255).optional(),
  title: z.string().trim().max(150).optional(),
  bio: z.string().trim().max(1000).optional(),
  photoUrl: z.string().url().optional(),
}).openapi('UpdateFacilitatorSchema', {
  title: 'Update Facilitator',
  description: 'Payload for updating a facilitator',
})

export type UpdateFacilitatorDto = z.infer<typeof UpdateFacilitatorSchema>

export const SubmitFacilitatorApplicationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().toLowerCase().max(255),
  linkedinUrl: z.string().url().max(255),
  bio: z.string().trim().max(1000).optional(),
  whyJoin: z.string().trim().max(1000).optional(),
})
export type SubmitFacilitatorApplicationDto = z.infer<typeof SubmitFacilitatorApplicationSchema>

export const UpdateFacilitatorApplicationStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
})
export type UpdateFacilitatorApplicationStatusDto = z.infer<typeof UpdateFacilitatorApplicationStatusSchema>
