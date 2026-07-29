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
  
  const rawOriginalUsd = course.priceUsd ?? 0
  const rawOriginalNgn = course.priceNgn ?? 0
  
  const rawCurrentUsd = discounted ? (course.discountedPriceUsd ?? 0) : rawOriginalUsd
  const rawCurrentNgn = discounted ? (course.discountedPriceNgn ?? 0) : rawOriginalNgn

  return {
    discounted,
    discountPercent: course.discountPercent ?? 0,
    original: [
      formatMoney(rawOriginalUsd, 'USD'),
      formatMoney(rawOriginalNgn, 'NGN'),
    ].join(' • '),
    current: [
      formatMoney(rawCurrentUsd, 'USD'),
      formatMoney(rawCurrentNgn, 'NGN'),
    ].join(' • '),
  }
}
