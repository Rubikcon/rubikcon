/**
 * Extract a usable URL from whatever the user pasted.
 *
 * Real-world admins paste a mix of things into "URL" fields:
 *
 *   1. A bare URL (the ideal case) →  returned as-is.
 *   2. A Canva / Google Slides / YouTube *embed code* — a `<div>...<iframe
 *      src="...">...</iframe></div>` block. The schema-level URL validator
 *      then rejects the whole HTML as "not a URL", and the admin gets a
 *      cryptic "Validation failed" with no clue what to do. We sniff the
 *      `src="..."` out of the iframe and use that.
 *   3. A bare iframe tag without surrounding divs.
 *   4. A URL missing the `https://` scheme.
 *
 * Anything we can't normalize is returned trimmed so the backend's own
 * URL validator can produce a sensible error.
 */
export function extractEmbedUrl(input: string): string {
  if (!input) return ''
  const trimmed = input.trim()
  if (!trimmed) return ''

  // Case 1: already a URL.
  if (/^https?:\/\//i.test(trimmed)) return trimmed

  // Case 2 & 3: iframe embed code. Pull the value of the first `src=...`
  // attribute we can find. Handles single quotes, double quotes, and the
  // odd typographic quote characters that "smart" word processors insert.
  const srcMatch = trimmed.match(/src\s*=\s*["'“”]([^"'“”]+)["'“”]/i)
  if (srcMatch && srcMatch[1]) {
    const candidate = srcMatch[1].trim()
    if (/^https?:\/\//i.test(candidate)) return candidate
    // Protocol-relative URL? Pin it to https.
    if (candidate.startsWith('//')) return `https:${candidate}`
  }

  // Case 4: bare domain like "docs.google.com/presentation/d/…" — assume https.
  if (/^[a-z0-9.-]+\.[a-z]{2,}\//i.test(trimmed)) return `https://${trimmed}`

  // Give up — let the backend tell the user what's wrong.
  return trimmed
}
