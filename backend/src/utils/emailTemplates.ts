import { config } from '../config/env'

/**
 * HTML email templates. Kept inline (no external template engine) so they're
 * easy to read and tweak. All use a shared dark-on-light layout consistent
 * with the academy brand (#F5C518 yellow accent).
 */

function layout(opts: { title: string; bodyHtml: string; ctaLabel?: string; ctaUrl?: string }): string {
  const { title, bodyHtml, ctaLabel, ctaUrl } = opts
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background:#0A0A0A;padding:24px 32px;">
                <span style="color:#F5C518;font-weight:800;font-size:18px;letter-spacing:-0.02em;">Rubikcon Academy</span>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#1c1c1c;line-height:1.3;">${title}</h1>
                <div style="font-size:15px;line-height:1.6;color:#3f3f46;">${bodyHtml}</div>
                ${ctaLabel && ctaUrl ? `
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
                  <tr>
                    <td style="border-radius:999px;background:#F5C518;">
                      <a href="${ctaUrl}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:700;color:#0A0A0A;text-decoration:none;border-radius:999px;">${ctaLabel}</a>
                    </td>
                  </tr>
                </table>` : ''}
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #f0f0f0;">
                <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.5;">
                  You're receiving this because you have an account on Rubikcon Academy.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function assignmentFeedbackEmail(opts: {
  learnerName: string | null
  assignmentTitle: string
  lessonTitle: string
  courseTitle: string
  feedbackText: string
  reviewerName: string | null
  lessonUrl: string
}): { subject: string; html: string; text: string } {
  const greeting = opts.learnerName ? `Hi ${escapeHtml(opts.learnerName.split(' ')[0])},` : 'Hi there,'
  const reviewer = opts.reviewerName ? escapeHtml(opts.reviewerName) : 'Your facilitator'

  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">${reviewer} just left feedback on your submission for
      <strong>${escapeHtml(opts.assignmentTitle)}</strong>
      in <strong>${escapeHtml(opts.courseTitle)}</strong>.</p>
    <div style="margin:0 0 8px;padding:16px;background:#faf7ec;border-left:3px solid #F5C518;border-radius:8px;">
      <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#a16207;font-weight:700;">Feedback</p>
      <p style="margin:8px 0 0;font-size:15px;line-height:1.6;color:#3f3f46;white-space:pre-line;">${escapeHtml(opts.feedbackText)}</p>
    </div>
  `

  const text = `${opts.learnerName ? `Hi ${opts.learnerName.split(' ')[0]},` : 'Hi there,'}

${opts.reviewerName || 'Your facilitator'} left feedback on your submission for "${opts.assignmentTitle}" in ${opts.courseTitle}.

Feedback:
${opts.feedbackText}

View it here: ${opts.lessonUrl}

— Rubikcon Academy`

  return {
    subject: `New feedback on your "${opts.assignmentTitle}" submission`,
    html: layout({
      title: 'You\'ve got feedback! 🎉',
      bodyHtml,
      ctaLabel: 'View feedback in your lesson',
      ctaUrl: opts.lessonUrl,
    }),
    text,
  }
}

/** Build a deep link to a lesson within a course. */
export function lessonDeepLink(courseSlug: string, weekSlug: string): string {
  return `${config.academyUrl}/course/${courseSlug}/week/${weekSlug}`
}
