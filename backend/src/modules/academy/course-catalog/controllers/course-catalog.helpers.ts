import { z } from 'zod';
import { sendError } from '../../../../utils/response';
import { Response } from 'express';
import { courseCatalogRepository } from '../repositories/course-catalog.repository';

export function maskEmail(email: string) {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  if (local.length <= 2) return `${local[0] || '*'}***@${domain}`
  return `${local.slice(0, 2)}***@${domain}`
}
export function serializeQuizForDelivery(
  quiz: {
    id: string
    title: string
    passMark: number
    attemptLimit: number
    questions: Array<{
      id: string
      prompt: string
      explanation: string
      position: number
      options: Array<{
        id: string
        label: string
        position: number
        isCorrect: boolean
      }>
    }>
  },
  latestAttempt?: {
    id: string
    score: number
    percentage: number
    submittedAt: Date
    status: string
    answers: Array<{
      questionId: string
      selectedOptionId: string
    }>
  } | null,
  unlockGranted?: boolean
) {
  const selectedOptionByQuestion = new Map(
    (latestAttempt?.answers ?? []).map(answer => [answer.questionId, answer.selectedOptionId])
  )

  return {
    id: quiz.id,
    title: quiz.title,
    passMark: quiz.passMark,
    attemptLimit: quiz.attemptLimit,
    unlockGranted: Boolean(unlockGranted),
    submitted: Boolean(latestAttempt),
    latestAttempt: latestAttempt
      ? {
          id: latestAttempt.id,
          score: latestAttempt.score,
          percentage: latestAttempt.percentage,
          submittedAt: latestAttempt.submittedAt,
          status: latestAttempt.status,
        }
      : null,
    questions: quiz.questions.map(question => ({
      id: question.id,
      prompt: question.prompt,
      explanation: latestAttempt ? question.explanation : null,
      position: question.position,
      options: question.options.map(option => ({
        id: option.id,
        label: option.label,
        position: option.position,
        isCorrect: latestAttempt ? option.isCorrect : undefined,
        isSelected: latestAttempt ? selectedOptionByQuestion.get(question.id) === option.id : false,
      })),
    })),
  }
}

export function serializeAssignmentsForDelivery(
  assignments: Array<{
    id: string
    title: string
    instructions: string
    deadline: Date
    allowTextSubmission: boolean
    allowFileUpload: boolean
    position: number
    choices: Array<{
      id: string
      title: string
      description: string
      position: number
    }>
  }>,
  submissions: Array<{
    id: string
    assignmentId: string
    choiceId: string | null
    textResponse: string | null
    attachmentName: string | null
    attachmentUrl: string | null
    attachmentMimeType: string | null
    attachmentSizeBytes: number | null
    status: string
    submittedAt: Date
    reviewedAt: Date | null
    feedback: Array<{
      id: string
      feedback: string
      rating: number | null
      createdAt: Date
      reviewer: {
        id: string
        name: string | null
        email: string
      }
    }>
  }>
) {
  const latestSubmissionByAssignment = new Map<string, typeof submissions[number]>()
  for (const submission of submissions) {
    const existing = latestSubmissionByAssignment.get(submission.assignmentId)
    if (!existing || submission.submittedAt > existing.submittedAt) {
      latestSubmissionByAssignment.set(submission.assignmentId, submission)
    }
  }

  return assignments.map(assignment => {
    const latestSubmission = latestSubmissionByAssignment.get(assignment.id)
    return {
      id: assignment.id,
      title: assignment.title,
      instructions: assignment.instructions,
      deadline: assignment.deadline,
      allowTextSubmission: assignment.allowTextSubmission,
      allowFileUpload: assignment.allowFileUpload,
      position: assignment.position,
      status: latestSubmission?.status ?? 'NOT_STARTED',
      choices: assignment.choices,
      latestSubmission: latestSubmission
        ? {
            id: latestSubmission.id,
            choiceId: latestSubmission.choiceId,
            textResponse: latestSubmission.textResponse,
            attachmentName: latestSubmission.attachmentName,
            attachmentUrl: latestSubmission.attachmentUrl,
            attachmentMimeType: latestSubmission.attachmentMimeType,
            attachmentSizeBytes: latestSubmission.attachmentSizeBytes,
            status: latestSubmission.status,
            submittedAt: latestSubmission.submittedAt,
            reviewedAt: latestSubmission.reviewedAt,
            feedback: latestSubmission.feedback.map(item => ({
              id: item.id,
              feedback: item.feedback,
              rating: item.rating,
              createdAt: item.createdAt,
              reviewerName: item.reviewer.name ?? item.reviewer.email,
            })),
          }
        : null,
    }
  })
}

export async function getUserWeekState(userId: string, weekId: string, quizId?: string | null) {
  const [savedTerms, readItems, weekProgress, latestAttempt, quizUnlock, submissions] = 
    await courseCatalogRepository.getUserWeekStateData(userId, weekId, quizId);

  return {
    savedTermIds: savedTerms.map((item) => item.termId),
    readResourceIds: readItems.map((item) => item.resourceId),
    weekProgress,
    latestAttempt,
    unlockGranted: Boolean(quizUnlock),
    submissions,
  }
}

export const moduleFeedbackSchema = z.object({
  feedback: z.string().min(1).max(2000),
})

export const testimonialSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().optional(),
  quote: z.string().min(1, 'Quote is required'),
  photoUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  position: z.number().int().default(0),
})

export async function getCourseOrFail(courseId: string, userId: string, role: string, res: Response) {
  const course = await courseCatalogRepository.findById(courseId)
  if (!course) {
    sendError(res, 'Course not found.', 404)
    return null
  }
  if (role !== 'SUPER_ADMIN' && role !== 'ADMIN' && course.createdById !== userId) {
    sendError(res, 'Forbidden. You do not own this course.', 403)
    return null
  }
  return course
}
