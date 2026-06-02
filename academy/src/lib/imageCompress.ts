/**
 * Browser-side image compression to base64 data URL.
 *
 * Strategy:
 *   1. Decode the file into an Image element.
 *   2. Resize on a canvas, preserving aspect ratio, capped at `maxDimension` px on
 *      the longest side (default 512). This alone usually drops file size 10×.
 *   3. Try JPEG encoding at decreasing quality steps until the resulting
 *      base64 data URL is under `maxBase64KB`.
 *   4. If the picture is still too large at quality 0.4, halve the dimension
 *      cap and recurse once. If still too large, throw with a friendly error.
 *
 * Returns a `data:image/jpeg;base64,…` string suitable for sending to the API
 * and storing in a `String?` DB column.
 */

export type CompressOptions = {
  /** Target maximum size of the resulting base64 string, in KB. Default 100. */
  maxBase64KB?: number
  /** Maximum dimension (px) on the longest side. Default 512. */
  maxDimension?: number
  /** Output mime type. JPEG gives the smallest files for photos. */
  mimeType?: 'image/jpeg' | 'image/webp'
}

const DEFAULTS: Required<CompressOptions> = {
  maxBase64KB: 100,
  maxDimension: 512,
  mimeType: 'image/jpeg',
}

const QUALITY_STEPS = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4]

export async function compressImageToBase64(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const opts = { ...DEFAULTS, ...options }

  if (!file.type.startsWith('image/')) {
    throw new Error('Selected file is not an image. Choose a JPEG, PNG, or WebP.')
  }

  const img = await loadImage(file)
  return compressFromImage(img, opts.maxDimension, opts.maxBase64KB, opts.mimeType)
}

function compressFromImage(
  img: HTMLImageElement,
  maxDimension: number,
  maxBase64KB: number,
  mimeType: 'image/jpeg' | 'image/webp'
): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Your browser does not support image processing.')

  // Resize while preserving aspect ratio.
  const longest = Math.max(img.naturalWidth, img.naturalHeight)
  const scale = longest > maxDimension ? maxDimension / longest : 1
  canvas.width = Math.round(img.naturalWidth * scale)
  canvas.height = Math.round(img.naturalHeight * scale)

  // White background — JPEG doesn't support transparency, and a white fill
  // looks far better than the default black for portrait photos.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  // Try progressively-lower quality until we fit.
  for (const quality of QUALITY_STEPS) {
    const dataUrl = canvas.toDataURL(mimeType, quality)
    if (estimateDataUrlKB(dataUrl) <= maxBase64KB) return dataUrl
  }

  // Still too big — recurse with a smaller cap once.
  if (maxDimension > 256) {
    return compressFromImage(img, Math.floor(maxDimension / 2), maxBase64KB, mimeType)
  }

  // Out of options.
  throw new Error(
    `Image is too detailed to compress under ${maxBase64KB} KB. Try a simpler picture (e.g. a portrait shot).`
  )
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Couldn't read that image file. It may be corrupted."))
    }
    img.src = url
  })
}

/** Estimate the size of a base64 data URL in KB. */
function estimateDataUrlKB(dataUrl: string): number {
  // A data URL is roughly `data:image/jpeg;base64,<...>` — the payload is 4/3
  // the size of the raw bytes. Length in bytes ≈ string length (ASCII).
  return Math.ceil(dataUrl.length / 1024)
}
