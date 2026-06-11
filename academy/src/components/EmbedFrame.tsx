import { useEffect, useRef, useState } from 'react'
import { AlertCircle, ExternalLink, Loader2, RefreshCw } from 'lucide-react'

/**
 * EmbedFrame
 *
 * A drop-in iframe wrapper that handles three states cleanly:
 *
 *   1. **Loading**     — shimmer skeleton overlay while the embed is loading.
 *   2. **Loaded**      — iframe visible, overlay gone.
 *   3. **Timeout/error** — after `timeoutMs` ms with no load, OR if the
 *      iframe's `onError` fires, an error panel takes over with an
 *      "Open in new tab" fallback and a "Try again" retry button.
 *
 * The retry button bumps an internal key, which re-mounts the iframe and
 * restarts the loading flow.
 *
 * Caveats on iframe error detection:
 *   - Cross-origin iframes never fire `onError` from us; we mainly rely on
 *     the `onLoad` event (which fires for the embed page itself).
 *   - Some embed providers (e.g. YouTube) render an in-iframe error UI even
 *     when the upstream resource is gone — we can't detect that from outside.
 *   - The timeout-based fallback catches the worst case: a deleted URL where
 *     the iframe never loads at all.
 */

type Props = {
  src: string
  title: string
  /** The original URL — used for the "Open in new tab" fallback so the user can troubleshoot externally. */
  fallbackUrl?: string
  /** CSS aspect ratio for the container. Defaults to 16/9 (video / typical slide). */
  aspectRatio?: '16/9' | '4/3' | '1/1'
  /** Time (ms) after which we assume the embed isn't going to load. Default 15s. */
  timeoutMs?: number
  /** Optional className applied to the outer wrapper. */
  className?: string
  /** Extra iframe permissions string. Defaults to a sensible video-friendly set. */
  allow?: string
}

const ASPECT_PADDING: Record<NonNullable<Props['aspectRatio']>, string> = {
  '16/9': '56.25%',
  '4/3': '75%',
  '1/1': '100%',
}

export default function EmbedFrame({
  src,
  title,
  fallbackUrl,
  aspectRatio = '16/9',
  timeoutMs = 15000,
  className = '',
  allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen',
}: Props) {
  type State = 'loading' | 'loaded' | 'error'
  const [state, setState] = useState<State>('loading')
  const [reloadKey, setReloadKey] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setState('loading')
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setState(prev => (prev === 'loading' ? 'error' : prev))
    }, timeoutMs)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [src, reloadKey, timeoutMs])

  function handleLoad() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setState('loaded')
  }

  function handleError() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setState('error')
  }

  function retry() {
    setReloadKey(k => k + 1)
  }

  return (
    <div
      className={`relative w-full bg-black/60 rounded-xl overflow-hidden ${className}`}
      style={{ paddingTop: ASPECT_PADDING[aspectRatio] }}
    >
      {/* Loading skeleton overlay */}
      {state === 'loading' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          {/* Animated shimmer background */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 100%)',
              backgroundSize: '200% 100%',
              animation: 'embed-shimmer 1.5s infinite linear',
            }}
          />
          <style>{`
            @keyframes embed-shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
          <div className="relative flex flex-col items-center gap-2 text-white/50">
            <Loader2 size={28} className="animate-spin text-[#F5C518]" />
            <p className="text-xs font-medium">Loading…</p>
          </div>
        </div>
      )}

      {/* Error / timeout fallback */}
      {state === 'error' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 px-6 text-center bg-[#0F0F11]">
          <div className="w-12 h-12 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
            <AlertCircle size={22} className="text-amber-400" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">Couldn't load this content</p>
            <p className="text-xs text-white/50 max-w-sm leading-relaxed">
              The link may have been moved, deleted, or restricted. Try opening it in a new tab — sometimes that works when the embed doesn't.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
            {fallbackUrl && (
              <a
                href={fallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#F5C518] px-4 py-2 text-xs font-semibold text-black hover:bg-[#E8B800] transition-colors"
              >
                Open in new tab <ExternalLink size={12} />
              </a>
            )}
            <button
              onClick={retry}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/70 hover:text-white hover:border-white/30 transition-colors"
            >
              <RefreshCw size={12} /> Try again
            </button>
          </div>
        </div>
      )}

      {/* Actual iframe — only mounted while we want to try loading it */}
      {state !== 'error' && (
        <iframe
          key={reloadKey}
          src={src}
          title={title}
          onLoad={handleLoad}
          onError={handleError}
          allow={allow}
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full"
          style={{ border: 0 }}
        />
      )}
    </div>
  )
}
