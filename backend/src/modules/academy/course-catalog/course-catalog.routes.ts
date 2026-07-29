import './course-catalog.swagger';
import './course-catalog.swagger'
import { Router } from 'express'
import { optionalAuth, requireAuth, requireAdmin, requireSuperAdmin } from '../../../middleware/auth.middleware'
import { courseCatalogController } from './controllers/course-catalog.controller'

const router = Router()

// Public platform endpoints
router.get('/testimonials', courseCatalogController.getTestimonials)
router.get('/facilitators', courseCatalogController.getFacilitators)
router.post('/contact', courseCatalogController.contactUs)
router.get('/public/stats', courseCatalogController.getPlatformStats)
router.get('/public/courses/:courseSlug/weeks/:weekSlug/videos/:videoId', courseCatalogController.getPublicSharedVideo)

// Public course catalog endpoints
router.get('/courses/meta', courseCatalogController.getFilterMeta)
router.get('/courses', optionalAuth, courseCatalogController.getPublicCourses)
router.get('/courses/:slug', optionalAuth, courseCatalogController.getCourseDetails)
router.get('/courses/:slug/weeks', optionalAuth, courseCatalogController.getCourseWeeks)
router.post('/courses/:slug/enroll', requireAuth, courseCatalogController.enroll)

// --- Admin Course Management ---

router.post(
  '/admin/courses',
  requireAuth,
  requireAdmin,
  courseCatalogController.createCourse.bind(courseCatalogController)
)

router.get(
  '/admin/courses',
  requireAuth,
  requireAdmin,
  courseCatalogController.getAdminCourses.bind(courseCatalogController)
)

router.get(
  '/admin/courses/:courseId',
  requireAuth,
  requireAdmin,
  courseCatalogController.getAdminCourseDetails.bind(courseCatalogController)
)

router.patch(
  '/admin/courses/:courseId',
  requireAuth,
  requireAdmin,
  courseCatalogController.updateCourse.bind(courseCatalogController)
)

router.delete(
  '/admin/courses/:courseId',
  requireAuth,
  requireAdmin,
  courseCatalogController.deleteCourse.bind(courseCatalogController)
)

router.post(
  '/admin/courses/:courseId/submit',
  requireAuth,
  requireAdmin,
  courseCatalogController.submitCourseForReview.bind(courseCatalogController)
)

// Modules
router.post('/admin/courses/:courseId/modules', requireAuth, requireAdmin, courseCatalogController.createModule.bind(courseCatalogController))
router.patch('/admin/courses/:courseId/modules/:moduleId', requireAuth, requireAdmin, courseCatalogController.updateModule.bind(courseCatalogController))
router.delete('/admin/courses/:courseId/modules/:moduleId', requireAuth, requireAdmin, courseCatalogController.deleteModule.bind(courseCatalogController))

// Weeks
router.post('/admin/courses/:courseId/weeks', requireAuth, requireAdmin, courseCatalogController.createWeek.bind(courseCatalogController))
router.patch('/admin/courses/:courseId/weeks/:weekId', requireAuth, requireAdmin, courseCatalogController.updateWeek.bind(courseCatalogController))
router.delete('/admin/courses/:courseId/weeks/:weekId', requireAuth, requireAdmin, courseCatalogController.deleteWeek.bind(courseCatalogController))
router.patch('/admin/courses/:courseId/weeks/:weekId/module', requireAuth, requireAdmin, courseCatalogController.setWeekModule.bind(courseCatalogController))

// --- Lessons ---
router.post('/admin/courses/:courseId/modules/:moduleId/lessons', requireAuth, requireAdmin, courseCatalogController.addLesson.bind(courseCatalogController))
router.delete('/lesson/:lessonId', requireAuth, requireAdmin, courseCatalogController.removeLesson.bind(courseCatalogController))

// --- Lesson Facilitators ---
router.post('/lessons/:lessonId/facilitators', requireAuth, requireAdmin, courseCatalogController.addLessonFacilitator.bind(courseCatalogController))
router.delete('/lessons/:lessonId/facilitators/:facilitatorId', requireAuth, requireAdmin, courseCatalogController.removeLessonFacilitator.bind(courseCatalogController))

// --- Admin Lesson Content Management ---
router.patch('/admin/courses/:courseId/weeks/:weekId/content', requireAuth, requireAdmin, courseCatalogController.updateWeekContent.bind(courseCatalogController))

// Images
router.post('/admin/courses/:courseId/weeks/:weekId/images', requireAuth, requireAdmin, courseCatalogController.addWeekImage.bind(courseCatalogController))
router.delete('/admin/courses/:courseId/weeks/:weekId/images/:imageId', requireAuth, requireAdmin, courseCatalogController.removeWeekImage.bind(courseCatalogController))

// Videos
router.post('/admin/courses/:courseId/weeks/:weekId/videos', requireAuth, requireAdmin, courseCatalogController.addWeekVideo.bind(courseCatalogController))
router.patch('/admin/courses/:courseId/weeks/:weekId/videos/order', requireAuth, requireAdmin, courseCatalogController.reorderWeekVideos.bind(courseCatalogController))
router.patch('/admin/courses/:courseId/weeks/:weekId/videos/:videoId', requireAuth, requireAdmin, courseCatalogController.updateWeekVideo.bind(courseCatalogController))
router.delete('/admin/courses/:courseId/weeks/:weekId/videos/:videoId', requireAuth, requireAdmin, courseCatalogController.removeWeekVideo.bind(courseCatalogController))

// Facilitators
router.post('/admin/courses/:courseId/weeks/:weekId/facilitators', requireAuth, requireAdmin, courseCatalogController.addWeekFacilitator.bind(courseCatalogController))
router.delete('/admin/courses/:courseId/weeks/:weekId/facilitators/:facilitatorId', requireAuth, requireAdmin, courseCatalogController.removeWeekFacilitator.bind(courseCatalogController))

// Glossary
router.post('/admin/courses/:courseId/weeks/:weekId/glossary', requireAuth, requireAdmin, courseCatalogController.addGlossaryTerm.bind(courseCatalogController))
router.patch('/admin/courses/:courseId/weeks/:weekId/glossary/:termId', requireAuth, requireAdmin, courseCatalogController.updateGlossaryTerm.bind(courseCatalogController))
router.delete('/admin/courses/:courseId/weeks/:weekId/glossary/:termId', requireAuth, requireAdmin, courseCatalogController.removeGlossaryTerm.bind(courseCatalogController))

// Reading Resources
router.post('/admin/courses/:courseId/weeks/:weekId/resources', requireAuth, requireAdmin, courseCatalogController.addReadingResource.bind(courseCatalogController))
router.patch('/admin/courses/:courseId/weeks/:weekId/resources/:resourceId', requireAuth, requireAdmin, courseCatalogController.updateReadingResource.bind(courseCatalogController))
router.delete('/admin/courses/:courseId/weeks/:weekId/resources/:resourceId', requireAuth, requireAdmin, courseCatalogController.removeReadingResource.bind(courseCatalogController))

// Slide Decks
router.post('/admin/courses/:courseId/weeks/:weekId/slides', requireAuth, requireAdmin, courseCatalogController.addSlideDeck.bind(courseCatalogController))
router.patch('/admin/courses/:courseId/weeks/:weekId/slides/:slideId', requireAuth, requireAdmin, courseCatalogController.updateSlideDeck.bind(courseCatalogController))
router.delete('/admin/courses/:courseId/weeks/:weekId/slides/:slideId', requireAuth, requireAdmin, courseCatalogController.removeSlideDeck.bind(courseCatalogController))

// --- SuperAdmin ---
router.get('/superadmin/courses', requireAuth, requireSuperAdmin, courseCatalogController.getCoursesAdmin.bind(courseCatalogController))
router.get('/superadmin/courses/:courseId', requireAuth, requireSuperAdmin, courseCatalogController.getCourseDetailsAdmin.bind(courseCatalogController))
router.post('/superadmin/courses/:courseId/approve', requireAuth, requireSuperAdmin, courseCatalogController.approveCourse.bind(courseCatalogController))
router.post('/superadmin/courses/:courseId/reject', requireAuth, requireSuperAdmin, courseCatalogController.rejectCourse.bind(courseCatalogController))
router.delete('/superadmin/courses/:courseId', requireAuth, requireSuperAdmin, courseCatalogController.deleteCourse.bind(courseCatalogController))

export const courseCatalogRoutes = router
router.get('/weeks/:weekSlug', optionalAuth, courseCatalogController.legacy_get_weeks_weekSlug.bind(courseCatalogController));
router.post('/modules/:moduleId/feedback', requireAuth, courseCatalogController.legacy_post_modules_moduleId_feedback.bind(courseCatalogController));
router.get('/weeks/:weekSlug/resources', optionalAuth, courseCatalogController.legacy_get_weeks_weekSlug_resources.bind(courseCatalogController));
router.get('/course', courseCatalogController.legacy_get_course.bind(courseCatalogController));
router.get('/course/:slug', optionalAuth, courseCatalogController.legacy_get_course_slug.bind(courseCatalogController));
router.get('/lesson/:id', courseCatalogController.legacy_get_lesson_id.bind(courseCatalogController));
router.patch('/lesson/:id', requireAuth, requireAdmin, courseCatalogController.legacy_patch_lesson_id.bind(courseCatalogController));
router.post('/lessons/:lessonId/videos', requireAuth, requireAdmin, courseCatalogController.legacy_post_lessons_lessonId_videos.bind(courseCatalogController));
router.put('/lesson-videos/:videoId', requireAuth, requireAdmin, courseCatalogController.legacy_put_lesson_videos_videoId.bind(courseCatalogController));
router.delete('/lesson-videos/:videoId', requireAuth, requireAdmin, courseCatalogController.legacy_delete_lesson_videos_videoId.bind(courseCatalogController));
router.get('/admin/testimonials', requireAuth, requireAdmin, courseCatalogController.legacy_get_admin_testimonials.bind(courseCatalogController));
router.post('/admin/testimonials', requireAuth, requireAdmin, courseCatalogController.legacy_post_admin_testimonials.bind(courseCatalogController));
router.put('/admin/testimonials/:id', requireAuth, requireAdmin, courseCatalogController.legacy_put_admin_testimonials_id.bind(courseCatalogController));
router.delete('/admin/testimonials/:id', requireAuth, requireAdmin, courseCatalogController.legacy_delete_admin_testimonials_id.bind(courseCatalogController));
router.post('/admin/courses/:courseId/facilitators', requireAuth, requireAdmin, courseCatalogController.legacy_post_admin_courses_courseId_facilitators.bind(courseCatalogController));
router.delete('/admin/courses/:courseId/facilitators/:facilitatorId', requireAuth, requireAdmin, courseCatalogController.legacy_delete_admin_courses_courseId_facilitators_facilitatorId.bind(courseCatalogController));
