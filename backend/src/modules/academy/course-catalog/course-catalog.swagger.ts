import { registry } from '../../../infrastructure/swagger/swagger'
import { z } from 'zod'
import {
  ContactSchema,
  CreateCourseSchema,
  UpdateCourseSchema,
  CreateWeekSchema,
  UpdateWeekSchema,
  CreateModuleSchema,
  UpdateModuleSchema,
  CreateLessonSchema,
  UpdateWeekContentSchema,
  CreateWeekImageSchema,
  CreateWeekVideoSchema,
  UpdateWeekVideoSchema,
  ReorderWeekVideosSchema,
  AssignWeekFacilitatorSchema,
  GlossaryTermSchema,
  ReadingResourceSchema,
  SlideDeckSchema,
} from './schemas/course-catalog.schemas'

// 1. GET /academy/testimonials
registry.registerPath({
  method: 'get',
  path: '/academy/testimonials',
  tags: ['Course Catalog'],
  summary: 'Get testimonials',
  responses: {
    200: {
      description: 'List of testimonials',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.array(z.record(z.unknown())) }) } },
    },
  },
})

// 2. GET /academy/facilitators
registry.registerPath({
  method: 'get',
  path: '/academy/facilitators',
  tags: ['Course Catalog'],
  summary: 'Get facilitators',
  responses: {
    200: {
      description: 'List of facilitators',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.array(z.record(z.unknown())) }) } },
    },
  },
})

// 3. POST /academy/contact
registry.registerPath({
  method: 'post',
  path: '/academy/contact',
  tags: ['Course Catalog'],
  summary: 'Submit contact form',
  request: {
    body: { content: { 'application/json': { schema: ContactSchema } } },
  },
  responses: {
    200: {
      description: 'Message sent successfully',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } },
    },
    400: { description: 'Validation Error' },
  },
})

// 4. GET /academy/public/stats
registry.registerPath({
  method: 'get',
  path: '/academy/public/stats',
  tags: ['Course Catalog'],
  summary: 'Get platform stats',
  responses: {
    200: {
      description: 'Platform statistics',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
  },
})

// 5. GET /academy/courses
registry.registerPath({
  method: 'get',
  path: '/academy/courses',
  tags: ['Course Catalog'],
  summary: 'Get public courses',
  responses: {
    200: {
      description: 'List of public courses',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.array(z.record(z.unknown())) }) } },
    },
  },
})

// 6. GET /academy/courses/{slug}
registry.registerPath({
  method: 'get',
  path: '/academy/courses/{slug}',
  tags: ['Course Catalog'],
  summary: 'Get course details by slug',
  request: {
    params: z.object({ slug: z.string() }),
  },
  responses: {
    200: {
      description: 'Course details',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    404: { description: 'Course not found' },
  },
})

// 7. GET /academy/courses/{slug}/weeks
registry.registerPath({
  method: 'get',
  path: '/academy/courses/{slug}/weeks',
  tags: ['Course Catalog'],
  summary: 'Get course weeks',
  request: {
    params: z.object({ slug: z.string() }),
  },
  responses: {
    200: {
      description: 'List of weeks',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.array(z.record(z.unknown())) }) } },
    },
    404: { description: 'Course not found' },
  },
})

// 8. POST /academy/admin/courses
registry.registerPath({
  method: 'post',
  path: '/academy/admin/courses',
  tags: ['Course Catalog - Admin'],
  summary: 'Create a new course',
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { 'application/json': { schema: CreateCourseSchema } } },
  },
  responses: {
    201: {
      description: 'Course created successfully',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    400: { description: 'Validation Error' },
    401: { description: 'Unauthorized' },
  },
})

// 9. GET /academy/admin/courses
registry.registerPath({
  method: 'get',
  path: '/academy/admin/courses',
  tags: ['Course Catalog - Admin'],
  summary: 'Get admin courses list',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'List of admin courses',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.array(z.record(z.unknown())) }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 10. GET /academy/admin/courses/{courseId}
registry.registerPath({
  method: 'get',
  path: '/academy/admin/courses/{courseId}',
  tags: ['Course Catalog - Admin'],
  summary: 'Get admin course details',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Course details retrieved',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
    404: { description: 'Course not found' },
  },
})

// 11. PATCH /academy/admin/courses/{courseId}
registry.registerPath({
  method: 'patch',
  path: '/academy/admin/courses/{courseId}',
  tags: ['Course Catalog - Admin'],
  summary: 'Update course',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: UpdateCourseSchema } } },
  },
  responses: {
    200: {
      description: 'Course updated',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    400: { description: 'Validation Error' },
    401: { description: 'Unauthorized' },
    404: { description: 'Course not found' },
  },
})

// 12. DELETE /academy/admin/courses/{courseId}
registry.registerPath({
  method: 'delete',
  path: '/academy/admin/courses/{courseId}',
  tags: ['Course Catalog - Admin'],
  summary: 'Delete course',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Course deleted',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } },
    },
    401: { description: 'Unauthorized' },
    404: { description: 'Course not found' },
  },
})

// 13. POST /academy/admin/courses/{courseId}/submit
registry.registerPath({
  method: 'post',
  path: '/academy/admin/courses/{courseId}/submit',
  tags: ['Course Catalog - Admin'],
  summary: 'Submit course for review',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Course submitted for review',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
    404: { description: 'Course not found' },
  },
})

// 14. POST /academy/admin/courses/{courseId}/modules
registry.registerPath({
  method: 'post',
  path: '/academy/admin/courses/{courseId}/modules',
  tags: ['Course Catalog - Admin'],
  summary: 'Create module for course',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: CreateModuleSchema } } },
  },
  responses: {
    201: {
      description: 'Module created',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 15. PATCH /academy/admin/courses/{courseId}/modules/{moduleId}
registry.registerPath({
  method: 'patch',
  path: '/academy/admin/courses/{courseId}/modules/{moduleId}',
  tags: ['Course Catalog - Admin'],
  summary: 'Update module',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), moduleId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: UpdateModuleSchema } } },
  },
  responses: {
    200: {
      description: 'Module updated',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 16. DELETE /academy/admin/courses/{courseId}/modules/{moduleId}
registry.registerPath({
  method: 'delete',
  path: '/academy/admin/courses/{courseId}/modules/{moduleId}',
  tags: ['Course Catalog - Admin'],
  summary: 'Delete module',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), moduleId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Module deleted',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 17. POST /academy/admin/courses/{courseId}/weeks
registry.registerPath({
  method: 'post',
  path: '/academy/admin/courses/{courseId}/weeks',
  tags: ['Course Catalog - Admin'],
  summary: 'Create week',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: CreateWeekSchema } } },
  },
  responses: {
    201: {
      description: 'Week created',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 18. PATCH /academy/admin/courses/{courseId}/weeks/{weekId}
registry.registerPath({
  method: 'patch',
  path: '/academy/admin/courses/{courseId}/weeks/{weekId}',
  tags: ['Course Catalog - Admin'],
  summary: 'Update week',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), weekId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: UpdateWeekSchema } } },
  },
  responses: {
    200: {
      description: 'Week updated',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 19. DELETE /academy/admin/courses/{courseId}/weeks/{weekId}
registry.registerPath({
  method: 'delete',
  path: '/academy/admin/courses/{courseId}/weeks/{weekId}',
  tags: ['Course Catalog - Admin'],
  summary: 'Delete week',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), weekId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Week deleted',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 20. PATCH /academy/admin/courses/{courseId}/weeks/{weekId}/module
registry.registerPath({
  method: 'patch',
  path: '/academy/admin/courses/{courseId}/weeks/{weekId}/module',
  tags: ['Course Catalog - Admin'],
  summary: 'Set week module',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), weekId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: z.object({ moduleId: z.string().uuid().nullable() }) } } },
  },
  responses: {
    200: {
      description: 'Week module updated',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 21. POST /academy/admin/courses/{courseId}/modules/{moduleId}/lessons
registry.registerPath({
  method: 'post',
  path: '/academy/admin/courses/{courseId}/modules/{moduleId}/lessons',
  tags: ['Course Catalog - Admin'],
  summary: 'Add lesson to module',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), moduleId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: CreateLessonSchema } } },
  },
  responses: {
    201: {
      description: 'Lesson added',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 22. DELETE /academy/lesson/{lessonId}
registry.registerPath({
  method: 'delete',
  path: '/academy/lesson/{lessonId}',
  tags: ['Course Catalog - Admin'],
  summary: 'Remove lesson',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ lessonId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Lesson removed',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 23. POST /academy/lessons/{lessonId}/facilitators
registry.registerPath({
  method: 'post',
  path: '/academy/lessons/{lessonId}/facilitators',
  tags: ['Course Catalog - Admin'],
  summary: 'Add lesson facilitator',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ lessonId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: AssignWeekFacilitatorSchema } } },
  },
  responses: {
    201: {
      description: 'Facilitator added',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 24. DELETE /academy/lessons/{lessonId}/facilitators/{facilitatorId}
registry.registerPath({
  method: 'delete',
  path: '/academy/lessons/{lessonId}/facilitators/{facilitatorId}',
  tags: ['Course Catalog - Admin'],
  summary: 'Remove lesson facilitator',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ lessonId: z.string().uuid(), facilitatorId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Facilitator removed',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 25. PATCH /academy/admin/courses/{courseId}/weeks/{weekId}/content
registry.registerPath({
  method: 'patch',
  path: '/academy/admin/courses/{courseId}/weeks/{weekId}/content',
  tags: ['Course Catalog - Admin'],
  summary: 'Update week content',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), weekId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: UpdateWeekContentSchema } } },
  },
  responses: {
    200: {
      description: 'Week content updated',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 26. POST /academy/admin/courses/{courseId}/weeks/{weekId}/images
registry.registerPath({
  method: 'post',
  path: '/academy/admin/courses/{courseId}/weeks/{weekId}/images',
  tags: ['Course Catalog - Admin'],
  summary: 'Add week image',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), weekId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: CreateWeekImageSchema } } },
  },
  responses: {
    201: {
      description: 'Image added',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 27. DELETE /academy/admin/courses/{courseId}/weeks/{weekId}/images/{imageId}
registry.registerPath({
  method: 'delete',
  path: '/academy/admin/courses/{courseId}/weeks/{weekId}/images/{imageId}',
  tags: ['Course Catalog - Admin'],
  summary: 'Remove week image',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), weekId: z.string().uuid(), imageId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Image removed',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 28. POST /academy/admin/courses/{courseId}/weeks/{weekId}/videos
registry.registerPath({
  method: 'post',
  path: '/academy/admin/courses/{courseId}/weeks/{weekId}/videos',
  tags: ['Course Catalog - Admin'],
  summary: 'Add week video',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), weekId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: CreateWeekVideoSchema } } },
  },
  responses: {
    201: {
      description: 'Video added',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 29. PATCH /academy/admin/courses/{courseId}/weeks/{weekId}/videos/order
registry.registerPath({
  method: 'patch',
  path: '/academy/admin/courses/{courseId}/weeks/{weekId}/videos/order',
  tags: ['Course Catalog - Admin'],
  summary: 'Reorder week videos',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), weekId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: ReorderWeekVideosSchema } } },
  },
  responses: {
    200: {
      description: 'Videos reordered',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 30. PATCH /academy/admin/courses/{courseId}/weeks/{weekId}/videos/{videoId}
registry.registerPath({
  method: 'patch',
  path: '/academy/admin/courses/{courseId}/weeks/{weekId}/videos/{videoId}',
  tags: ['Course Catalog - Admin'],
  summary: 'Update week video',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), weekId: z.string().uuid(), videoId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: UpdateWeekVideoSchema } } },
  },
  responses: {
    200: {
      description: 'Video updated',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 31. DELETE /academy/admin/courses/{courseId}/weeks/{weekId}/videos/{videoId}
registry.registerPath({
  method: 'delete',
  path: '/academy/admin/courses/{courseId}/weeks/{weekId}/videos/{videoId}',
  tags: ['Course Catalog - Admin'],
  summary: 'Remove week video',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), weekId: z.string().uuid(), videoId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Video removed',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 32. POST /academy/admin/courses/{courseId}/weeks/{weekId}/facilitators
registry.registerPath({
  method: 'post',
  path: '/academy/admin/courses/{courseId}/weeks/{weekId}/facilitators',
  tags: ['Course Catalog - Admin'],
  summary: 'Add week facilitator',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), weekId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: AssignWeekFacilitatorSchema } } },
  },
  responses: {
    201: {
      description: 'Facilitator added to week',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 33. DELETE /academy/admin/courses/{courseId}/weeks/{weekId}/facilitators/{facilitatorId}
registry.registerPath({
  method: 'delete',
  path: '/academy/admin/courses/{courseId}/weeks/{weekId}/facilitators/{facilitatorId}',
  tags: ['Course Catalog - Admin'],
  summary: 'Remove week facilitator',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), weekId: z.string().uuid(), facilitatorId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Facilitator removed from week',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 34. POST /academy/admin/courses/{courseId}/weeks/{weekId}/glossary
registry.registerPath({
  method: 'post',
  path: '/academy/admin/courses/{courseId}/weeks/{weekId}/glossary',
  tags: ['Course Catalog - Admin'],
  summary: 'Add glossary term',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), weekId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: GlossaryTermSchema } } },
  },
  responses: {
    201: {
      description: 'Glossary term created',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 35. PATCH /academy/admin/courses/{courseId}/weeks/{weekId}/glossary/{termId}
registry.registerPath({
  method: 'patch',
  path: '/academy/admin/courses/{courseId}/weeks/{weekId}/glossary/{termId}',
  tags: ['Course Catalog - Admin'],
  summary: 'Update glossary term',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), weekId: z.string().uuid(), termId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: GlossaryTermSchema.partial() } } },
  },
  responses: {
    200: {
      description: 'Glossary term updated',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 36. DELETE /academy/admin/courses/{courseId}/weeks/{weekId}/glossary/{termId}
registry.registerPath({
  method: 'delete',
  path: '/academy/admin/courses/{courseId}/weeks/{weekId}/glossary/{termId}',
  tags: ['Course Catalog - Admin'],
  summary: 'Remove glossary term',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), weekId: z.string().uuid(), termId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Glossary term deleted',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 37. POST /academy/admin/courses/{courseId}/weeks/{weekId}/resources
registry.registerPath({
  method: 'post',
  path: '/academy/admin/courses/{courseId}/weeks/{weekId}/resources',
  tags: ['Course Catalog - Admin'],
  summary: 'Add reading resource',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), weekId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: ReadingResourceSchema } } },
  },
  responses: {
    201: {
      description: 'Reading resource created',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 38. PATCH /academy/admin/courses/{courseId}/weeks/{weekId}/resources/{resourceId}
registry.registerPath({
  method: 'patch',
  path: '/academy/admin/courses/{courseId}/weeks/{weekId}/resources/{resourceId}',
  tags: ['Course Catalog - Admin'],
  summary: 'Update reading resource',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), weekId: z.string().uuid(), resourceId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: ReadingResourceSchema.partial() } } },
  },
  responses: {
    200: {
      description: 'Reading resource updated',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 39. DELETE /academy/admin/courses/{courseId}/weeks/{weekId}/resources/{resourceId}
registry.registerPath({
  method: 'delete',
  path: '/academy/admin/courses/{courseId}/weeks/{weekId}/resources/{resourceId}',
  tags: ['Course Catalog - Admin'],
  summary: 'Remove reading resource',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), weekId: z.string().uuid(), resourceId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Reading resource deleted',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 40. POST /academy/admin/courses/{courseId}/weeks/{weekId}/slides
registry.registerPath({
  method: 'post',
  path: '/academy/admin/courses/{courseId}/weeks/{weekId}/slides',
  tags: ['Course Catalog - Admin'],
  summary: 'Add slide deck',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), weekId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: SlideDeckSchema } } },
  },
  responses: {
    201: {
      description: 'Slide deck created',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 41. PATCH /academy/admin/courses/{courseId}/weeks/{weekId}/slides/{slideId}
registry.registerPath({
  method: 'patch',
  path: '/academy/admin/courses/{courseId}/weeks/{weekId}/slides/{slideId}',
  tags: ['Course Catalog - Admin'],
  summary: 'Update slide deck',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), weekId: z.string().uuid(), slideId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: SlideDeckSchema.partial() } } },
  },
  responses: {
    200: {
      description: 'Slide deck updated',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 42. DELETE /academy/admin/courses/{courseId}/weeks/{weekId}/slides/{slideId}
registry.registerPath({
  method: 'delete',
  path: '/academy/admin/courses/{courseId}/weeks/{weekId}/slides/{slideId}',
  tags: ['Course Catalog - Admin'],
  summary: 'Remove slide deck',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid(), weekId: z.string().uuid(), slideId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Slide deck deleted',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } },
    },
    401: { description: 'Unauthorized' },
  },
})

// 43. GET /academy/superadmin/courses
registry.registerPath({
  method: 'get',
  path: '/academy/superadmin/courses',
  tags: ['Course Catalog - SuperAdmin'],
  summary: 'Get courses (SuperAdmin)',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'List of all courses for superadmin',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.array(z.record(z.unknown())) }) } },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
})

// 44. GET /academy/superadmin/courses/{courseId}
registry.registerPath({
  method: 'get',
  path: '/academy/superadmin/courses/{courseId}',
  tags: ['Course Catalog - SuperAdmin'],
  summary: 'Get course details (SuperAdmin)',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Course details retrieved',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
})

// 45. POST /academy/superadmin/courses/{courseId}/approve
registry.registerPath({
  method: 'post',
  path: '/academy/superadmin/courses/{courseId}/approve',
  tags: ['Course Catalog - SuperAdmin'],
  summary: 'Approve course (SuperAdmin)',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Course approved',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
})

// 46. POST /academy/superadmin/courses/{courseId}/reject
registry.registerPath({
  method: 'post',
  path: '/academy/superadmin/courses/{courseId}/reject',
  tags: ['Course Catalog - SuperAdmin'],
  summary: 'Reject course (SuperAdmin)',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Course rejected',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.record(z.unknown()) }) } },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
})

// 47. DELETE /academy/superadmin/courses/{courseId}
registry.registerPath({
  method: 'delete',
  path: '/academy/superadmin/courses/{courseId}',
  tags: ['Course Catalog - SuperAdmin'],
  summary: 'Delete course (SuperAdmin)',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ courseId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Course deleted',
      content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
})

// --- Legacy Routes ---

// 48. GET /academy/weeks/{weekSlug}
registry.registerPath({
  method: 'get',
  path: '/academy/weeks/{weekSlug}',
  tags: ['Course Catalog - Legacy'],
  summary: 'Legacy: Get week details by slug',
  request: { params: z.object({ weekSlug: z.string() }) },
  responses: { 200: { description: 'Week details' } },
})

// 49. POST /academy/modules/{moduleId}/feedback
registry.registerPath({
  method: 'post',
  path: '/academy/modules/{moduleId}/feedback',
  tags: ['Course Catalog - Legacy'],
  summary: 'Legacy: Post module feedback',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ moduleId: z.string() }) },
  responses: { 200: { description: 'Feedback posted' } },
})

// 50. GET /academy/weeks/{weekSlug}/resources
registry.registerPath({
  method: 'get',
  path: '/academy/weeks/{weekSlug}/resources',
  tags: ['Course Catalog - Legacy'],
  summary: 'Legacy: Get week resources',
  request: { params: z.object({ weekSlug: z.string() }) },
  responses: { 200: { description: 'Week resources' } },
})

// 51. GET /academy/course
registry.registerPath({
  method: 'get',
  path: '/academy/course',
  tags: ['Course Catalog - Legacy'],
  summary: 'Legacy: Get course',
  responses: { 200: { description: 'Course info' } },
})

// 52. GET /academy/course/{slug}
registry.registerPath({
  method: 'get',
  path: '/academy/course/{slug}',
  tags: ['Course Catalog - Legacy'],
  summary: 'Legacy: Get course by slug',
  request: { params: z.object({ slug: z.string() }) },
  responses: { 200: { description: 'Course info' } },
})

// 53. GET /academy/lesson/{id}
registry.registerPath({
  method: 'get',
  path: '/academy/lesson/{id}',
  tags: ['Course Catalog - Legacy'],
  summary: 'Legacy: Get lesson by ID',
  request: { params: z.object({ id: z.string() }) },
  responses: { 200: { description: 'Lesson info' } },
})

// 54. PATCH /academy/lesson/{id}
registry.registerPath({
  method: 'patch',
  path: '/academy/lesson/{id}',
  tags: ['Course Catalog - Legacy'],
  summary: 'Legacy: Patch lesson by ID',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: { 200: { description: 'Lesson patched' } },
})

// 55. POST /academy/lessons/{lessonId}/videos
registry.registerPath({
  method: 'post',
  path: '/academy/lessons/{lessonId}/videos',
  tags: ['Course Catalog - Legacy'],
  summary: 'Legacy: Add video to lesson',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ lessonId: z.string() }) },
  responses: { 200: { description: 'Video added' } },
})

// 56. PUT /academy/lesson-videos/{videoId}
registry.registerPath({
  method: 'put',
  path: '/academy/lesson-videos/{videoId}',
  tags: ['Course Catalog - Legacy'],
  summary: 'Legacy: Update lesson video',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ videoId: z.string() }) },
  responses: { 200: { description: 'Video updated' } },
})

// 57. DELETE /academy/lesson-videos/{videoId}
registry.registerPath({
  method: 'delete',
  path: '/academy/lesson-videos/{videoId}',
  tags: ['Course Catalog - Legacy'],
  summary: 'Legacy: Delete lesson video',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ videoId: z.string() }) },
  responses: { 200: { description: 'Video deleted' } },
})

// 58. GET /academy/admin/testimonials
registry.registerPath({
  method: 'get',
  path: '/academy/admin/testimonials',
  tags: ['Course Catalog - Legacy'],
  summary: 'Legacy: Get admin testimonials',
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Admin testimonials' } },
})

// 59. POST /academy/admin/testimonials
registry.registerPath({
  method: 'post',
  path: '/academy/admin/testimonials',
  tags: ['Course Catalog - Legacy'],
  summary: 'Legacy: Create admin testimonial',
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Testimonial created' } },
})

// 60. PUT /academy/admin/testimonials/{id}
registry.registerPath({
  method: 'put',
  path: '/academy/admin/testimonials/{id}',
  tags: ['Course Catalog - Legacy'],
  summary: 'Legacy: Update admin testimonial',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: { 200: { description: 'Testimonial updated' } },
})

// 61. DELETE /academy/admin/testimonials/{id}
registry.registerPath({
  method: 'delete',
  path: '/academy/admin/testimonials/{id}',
  tags: ['Course Catalog - Legacy'],
  summary: 'Legacy: Delete admin testimonial',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: { 200: { description: 'Testimonial deleted' } },
})

// 62. POST /academy/admin/courses/{courseId}/facilitators
registry.registerPath({
  method: 'post',
  path: '/academy/admin/courses/{courseId}/facilitators',
  tags: ['Course Catalog - Legacy'],
  summary: 'Legacy: Add course facilitator',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ courseId: z.string() }) },
  responses: { 200: { description: 'Facilitator added' } },
})

// 63. DELETE /academy/admin/courses/{courseId}/facilitators/{facilitatorId}
registry.registerPath({
  method: 'delete',
  path: '/academy/admin/courses/{courseId}/facilitators/{facilitatorId}',
  tags: ['Course Catalog - Legacy'],
  summary: 'Legacy: Remove course facilitator',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ courseId: z.string(), facilitatorId: z.string() }) },
  responses: { 200: { description: 'Facilitator removed' } },
})
