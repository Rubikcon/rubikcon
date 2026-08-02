import { NotFoundError, ValidationError, ForbiddenError } from '../../../../shared/errors/AppError'
import { sendEmailInBackground } from '../../../../infrastructure/mail/mailer'
import { newSubmissionEmail, assignmentFeedbackEmail, lessonDeepLink } from '../../../../infrastructure/mail/templates'
import { progressService } from '../../progress/services/progress.service'
import { assignmentsRepository } from '../repositories/assignments.repository'

function serializeQuizForDelivery(quiz: any, latestAttempt: any, unlockGranted: any) {
  const effectiveLimit = quiz.attemptLimit + (unlockGranted ? 1 : 0)
  const isLocked = latestAttempt && (latestAttempt.percentage >= quiz.passMark || effectiveLimit <= 0)

  return {
    id: quiz.id,
    title: quiz.title,
    passMark: quiz.passMark,
    attemptLimit: quiz.attemptLimit,
    isLocked,
    questions: quiz.questions.map((q: any) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options.map((o: any) => ({ id: o.id, label: o.label })),
    })),
  }
}

function serializeAssignmentsForDelivery(assignments: any[], submissions: any[]) {
  return assignments.map(assignment => {
    const subs = submissions.filter(s => s.assignmentId === assignment.id)
    return {
      id: assignment.id,
      title: assignment.title,
      instructions: assignment.instructions,
      deadline: assignment.deadline,
      allowTextSubmission: assignment.allowTextSubmission,
      allowFileUpload: assignment.allowFileUpload,
      choices: assignment.choices,
      submissions: subs.map(s => ({
        id: s.id,
        status: s.status,
        submittedAt: s.submittedAt,
        textResponse: s.textResponse,
        attachmentName: s.attachmentName,
        attachmentUrl: s.attachmentUrl,
        choice: s.choice ? { id: s.choice.id, title: s.choice.title } : null,
        feedback: s.feedback.map((f: any) => ({
          id: f.id,
          feedback: f.feedback,
          rating: f.rating,
          createdAt: f.createdAt,
          admin: f.admin,
        })),
      })),
    }
  })
}

export class AssignmentsService {
  async submitAssignment(userId: string, assignmentId: string, data: any) {
    const assignment = await assignmentsRepository.findById(assignmentId)
    if (!assignment) throw new NotFoundError('Assignment not found.')

    if (data.choiceId && !assignment.choices.some((c: any) => c.id === data.choiceId)) {
      throw new ValidationError('Selected assignment choice is invalid.')
    }

    if (!assignment.allowTextSubmission && data.textResponse) {
      throw new ValidationError('Text submissions are not allowed for this assignment.')
    }
    if (!assignment.allowFileUpload && data.attachmentUrl) {
      throw new ValidationError('File uploads are not allowed for this assignment.')
    }

    const submission = await assignmentsRepository.createSubmission(userId, assignment.id, data.choiceId, data)
    await progressService.syncWeekProgress(userId, assignment.week.id)

    this.notifyFacilitatorsOfSubmission(assignment, data.textResponse)

    return { submission, assignment }
  }

  private notifyFacilitatorsOfSubmission(assignment: any, textResponse?: string) {
    const facilitators = [
      assignment.week.course.createdBy?.email,
      ...assignment.week.course.courseFacilitators.map((cf: any) => cf.facilitator.email)
    ].filter(Boolean)

    if (facilitators.length > 0) {
      const uniqueFacilitators = Array.from(new Set(facilitators))
      sendEmailInBackground({
        to: uniqueFacilitators as string[],
        subject: `New Submission: ${assignment.title}`,
        html: newSubmissionEmail({
          courseTitle: assignment.week.course.title,
          lessonTitle: assignment.week.title,
          assignmentTitle: assignment.title,
          learnerName: 'A student',
          learnerEmail: 'student@example.com',
          facilitatorName: null,
          submissionPreview: textResponse || 'File attached',
          submittedAt: new Date(),
        }).html
      })
    }
  }

  async getSubmissions(courseId: string | undefined, userId: string, email: string, role: string, page = 1, limit = 20) {
    if (courseId) {
      const access = await assignmentsRepository.findCourseForAdmin(courseId, userId, email, role)
      if (!access) throw new NotFoundError('Course not found or access denied.')
    } else if (role !== 'SUPER_ADMIN') {
      throw new ForbiddenError('Super Admin role required to fetch all submissions.')
    }

    const skip = (page - 1) * limit
    const { submissions, total } = await assignmentsRepository.findSubmissionsByCourse(courseId, skip, limit)
    return { 
      submissions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async provideFeedback(submissionId: string, adminId: string, feedbackText: string, rating?: number) {
    const submission = await assignmentsRepository.findSubmissionById(submissionId)
    if (!submission) throw new NotFoundError('Submission not found.')

    const feedback = await assignmentsRepository.createFeedback(submission.id, adminId, feedbackText, rating)
    
    if (submission.status === 'SUBMITTED') {
      await assignmentsRepository.updateSubmissionStatus(submission.id, 'REVIEWED' as any)
    }

    sendEmailInBackground({
      to: [submission.user.email],
      subject: `Feedback Received: ${submission.assignment.title}`,
      html: assignmentFeedbackEmail({
        courseTitle: submission.assignment.week.course.title,
        lessonTitle: submission.assignment.week.title,
        assignmentTitle: submission.assignment.title,
        learnerName: submission.user.name,
        feedbackText: feedbackText,
        reviewerName: null,
        lessonUrl: lessonDeepLink(submission.assignment.week.course.slug, submission.assignment.week.slug),
      }).html
    })

    return { feedback }
  }

  async deleteFeedback(feedbackId: string, userId: string, email: string, role: string) {
    const feedback = await assignmentsRepository.findFeedbackById(feedbackId)
    if (!feedback) throw new NotFoundError('Feedback not found.')

    const courseId = feedback.submission.assignment.week.course.id
    const access = await assignmentsRepository.findCourseForAdmin(courseId, userId, email, role)
    if (!access) throw new ForbiddenError('Access denied.')

    await assignmentsRepository.deleteFeedback(feedbackId)
    return { success: true }
  }

  async createAssignment(courseId: string, weekId: string, userId: string, email: string, role: string, data: any) {
    const course = await assignmentsRepository.findCourseForAdmin(courseId, userId, email, role)
    if (!course) throw new NotFoundError('Course not found.')

    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new ValidationError('Cannot edit an approved course.')
    }

    const position = data.position ?? ((await assignmentsRepository.countAssignmentsByWeek(weekId)) + 1)
    const assignment = await assignmentsRepository.create(weekId, { ...data, position })
    return { assignment }
  }

  async deleteAssignment(courseId: string, weekId: string, assignmentId: string, userId: string, email: string, role: string) {
    const course = await assignmentsRepository.findCourseForAdmin(courseId, userId, email, role)
    if (!course) throw new NotFoundError('Course not found.')

    if (course.status === 'APPROVED' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new ValidationError('Cannot edit an approved course.')
    }

    const assignment = await assignmentsRepository.findAssignmentInWeek(assignmentId, weekId)
    if (!assignment) throw new NotFoundError('Assignment not found.')

    await assignmentsRepository.delete(assignmentId)
    return { success: true }
  }

  async getWeekAssignments(weekSlug: string, user: any | null) {
    const week = await assignmentsRepository.findWeekBySlug(weekSlug)
    if (!week || !week.published) throw new NotFoundError('Week not found.')

    const userState = user ? await assignmentsRepository.getUserWeekState(user.userId, week.id, week.quiz?.id) : null

    return {
      quiz: week.quiz ? serializeQuizForDelivery(week.quiz, userState?.latestAttempt, userState?.unlockGranted) : null,
      tasks: serializeAssignmentsForDelivery(week.assignments, userState?.submissions ?? []),
      progress: userState?.weekProgress ? {
        status: userState.weekProgress.status,
        quizSubmitted: userState.weekProgress.quizSubmitted,
        assignmentSubmitted: userState.weekProgress.assignmentSubmitted,
      } : {
        status: 'NOT_STARTED',
        quizSubmitted: false,
        assignmentSubmitted: false,
      }
    }
  }
}

export const assignmentsService = new AssignmentsService()
