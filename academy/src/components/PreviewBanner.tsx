import { Eye } from 'lucide-react'
import type { CourseStatus } from '../types/academy'

/**
 * Small sticky banner shown at the top of the CoursePage / LessonPage when a
 * facilitator (or super admin) is previewing a course they manage. Makes it
 * obvious they're seeing the learner view, not their normal admin view.
 */
type Props = {
  status?: CourseStatus
  published?: boolean
  /** URL to go back to the admin view of this course. */
  backToAdminUrl: string
  /** Optional sub-message — e.g. on lesson pages we say "this lesson is unpublished". */
  contextMessage?: string
}

const STATUS_LABEL: Record<CourseStatus, string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Pending review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

export default function PreviewBanner({ status, published, backToAdminUrl, contextMessage }: Props) {
  const statusLabel = status ? STATUS_LABEL[status] : null
  return (
    <div className="sticky top-0 z-30 bg-[#F5C518] text-[#0A0A0A] border-b border-black/15">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-2.5 flex flex-wrap items-center gap-3 text-sm">
        <Eye size={14} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold">
            Facilitator preview {statusLabel ? <span className="opacity-70 font-medium">· {statusLabel}{!published && status === 'APPROVED' ? ' · unpublished' : ''}</span> : ''}
          </p>
          {contextMessage && (
            <p className="text-xs opacity-75 leading-snug">{contextMessage}</p>
          )}
        </div>
        <a
          href={backToAdminUrl}
          className="flex-shrink-0 rounded-full bg-black/15 hover:bg-black/25 px-3.5 py-1.5 text-xs font-semibold transition-colors"
        >
          Exit preview →
        </a>
      </div>
    </div>
  )
}
