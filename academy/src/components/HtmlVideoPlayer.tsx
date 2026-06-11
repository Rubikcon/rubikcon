import { useEffect, useRef, useState } from 'react'
import { AlertCircle, ExternalLink, Loader2, RefreshCw } from 'lucide-react'

/**
 * HtmlVideoPlayer
 *
 * Wraps the native <video> element with the same skeleton + error-state UX
 * as EmbedFrame, for direct video file URLs (mp4, webm, etc.).
 *
 *  - Skeleton shimmer while loading
 *  - Hides skeleton once `canplay` fires
 *  - Shows an error panel with "Open in new tab" + retry on `error`
 *  - Retry remounts the <video> to restart loading
 */

type Props = {
  src: string
  title?: string
  className?: string
}

export default function HtmlVideoPlayer({ src, title, className = '' }: Props) {
  type State = 'loading' | 'loaded' | 'error'
  const [state, setState] = useState<State>('loading')
  const [reloadKey, setReloadKey] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setState('loading')
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    // Direct video files should start loading much faster than iframe embeds.
    // 12s is generous for a slow connection but still feels actionable.
    timeoutRef.current = setTimeout(() => {
      setState(prev => (prev === 'loading' ? 'error' : prev))
    }, 12000)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [src, reloadKey])

  function handleCanPlay() {
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
      className={`relative w-full bg-black ${className}`}
      style={{ paddingTop: '56.25%' }}
    >
      {state === 'loading' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 100%)',
              backgroundSize: '200% 100%',
              animation: 'video-shimmer 1.5s infinite linear',
            }}
          />
          <style>{`
            @keyframes video-shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
          <div className="relative flex flex-col items-center gap-2 text-white/50">
            <Loader2 size={28} className="animate-spin text-[#F5C518]" />
            <p className="text-xs font-medium">Loading video…</p>
          </div>
        </div>
      )}

      {state === 'error' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 px-6 text-center bg-[#0F0F11]">
          <div className="w-12 h-12 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
            <AlertCircle size={22} className="text-amber-400" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">Couldn't load this video</p>
            <p className="text-xs text-white/50 max-w-sm leading-relaxed">
              The video file may have been moved, deleted, or restricted. Try opening it in a new tab.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#F5C518] px-4 py-2 text-xs font-semibold text-black hover:bg-[#E8B800] transition-colors"
            >
              Open in new tab <ExternalLink size={12} />
            </a>
            <button
              onClick={retry}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/70 hover:text-white hover:border-white/30 transition-colors"
            >
              <RefreshCw size={12} /> Try again
            </button>
          </div>
        </div>
      )}

      {state !== 'error' && (
        <video
          key={reloadKey}
          src={src}
          title={title}
          controls
          controlsList="nodownload"
          onCanPlay={handleCanPlay}
          onError={handleError}
          className="absolute inset-0 w-full h-full"
          style={{ background: '#000' }}
        >
          Your browser does not support embedded video.{' '}
          <a href={src} target="_blank" rel="noreferrer" className="text-[#F5C518] underline">
            Open video
          </a>
        </video>
      )}
    </div>
  )
}
