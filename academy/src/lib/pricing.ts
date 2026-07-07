// Shared course-pricing helpers. The backend returns explicit USD and NGN
// figures plus pre-computed discounted values; these helpers format them for
// the storefront ("was $X / ₦Y, now $A / ₦B, −Z%").

export type CoursePricing = {
  priceUsd: number | null
  priceNgn: number | null
  discountPercent: number
  discountedPriceUsd: number | null
  discountedPriceNgn: number | null
}

export function formatMoney(value: number, currency: 'USD' | 'NGN') {
  return new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/** Returns null when the course has no price set (i.e. free / fees TBA). */
export function coursePriceInfo(course: CoursePricing) {
  const hasUsd = (course.priceUsd ?? 0) > 0
  const hasNgn = (course.priceNgn ?? 0) > 0
  if (!hasUsd && !hasNgn) return null
  const discounted = (course.discountPercent ?? 0) > 0
  return {
    discounted,
    discountPercent: course.discountPercent ?? 0,
    original: [
      hasUsd ? formatMoney(course.priceUsd!, 'USD') : null,
      hasNgn ? formatMoney(course.priceNgn!, 'NGN') : null,
    ].filter(Boolean).join(' / '),
    current: [
      hasUsd ? formatMoney((discounted ? course.discountedPriceUsd : course.priceUsd)!, 'USD') : null,
      hasNgn ? formatMoney((discounted ? course.discountedPriceNgn : course.priceNgn)!, 'NGN') : null,
    ].filter(Boolean).join(' / '),
  }
}
