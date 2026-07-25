export function serializeCoursePricing(c: {
  isPaid: boolean
  priceUsd: { toNumber(): number } | null
  priceNgn: { toNumber(): number } | null
  discountPercent: number | null
}) {
  const priceUsd = c.priceUsd !== null ? Number(c.priceUsd) : null
  const priceNgn = c.priceNgn !== null ? Number(c.priceNgn) : null
  const discountPercent = Math.min(100, Math.max(0, c.discountPercent ?? 0))
  const hasPrice = (priceUsd ?? 0) > 0 || (priceNgn ?? 0) > 0
  const applyDiscount = (value: number | null) =>
    value === null ? null : Math.round(value * (100 - discountPercent)) / 100
  return {
    isPaid: c.isPaid || hasPrice,
    priceUsd,
    priceNgn,
    discountPercent,
    discountedPriceUsd: applyDiscount(priceUsd),
    discountedPriceNgn: applyDiscount(priceNgn),
  }
}

export function serializeWeekSummary(
  week: {
    id: string
    number: number
    slug: string
    title: string
    durationLabel: string
    estimatedCompletionMinutes: number
    moduleId?: string | null
    module?: { id: string; title: string; description: string | null } | null
  },
  progress?: {
    status: string
    quizSubmitted: boolean
    assignmentSubmitted: boolean
    completedAt: Date | null
  } | null
) {
  return {
    id: week.id,
    number: week.number,
    slug: week.slug,
    title: week.title,
    durationLabel: week.durationLabel,
    estimatedCompletionMinutes: week.estimatedCompletionMinutes,
    moduleId: week.moduleId ?? null,
    module: week.module ? { id: week.module.id, title: week.module.title, description: week.module.description } : null,
    progress: progress
      ? {
          status: progress.status,
          quizSubmitted: progress.quizSubmitted,
          assignmentSubmitted: progress.assignmentSubmitted,
          completedAt: progress.completedAt,
        }
      : {
          status: 'NOT_STARTED',
          quizSubmitted: false,
          assignmentSubmitted: false,
          completedAt: null,
        },
  }
}
