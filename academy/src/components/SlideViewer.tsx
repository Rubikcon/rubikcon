import { X, ExternalLink } from 'lucide-react'

function getGoogleSlidesEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    // Google Slides share URL
    if (u.hostname === 'docs.google.com' && u.pathname.includes('/presentation/')) {
      const id = u.pathname.split('/presentation/d/')[1]?.split('/')[0]
      if (id) return `https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false&delayms=3000`
    }
    // Direct embed URL
    if (u.pathname.includes('/embed') && u.hostname === 'docs.google.com') {
      return url
    }
    return null
  } catch {
    return null
  }
}

type Props = {
  url: string
  title: string
  slideCount: number
  sections?: string[]
  viewerType: 'MODAL' | 'EXTERNAL'
  onClose?: () => void
}

export default function SlideViewer({
  url,
  title,
  slideCount,
  sections = [],
  viewerType,
  onClose,
}: Props) {
  const embedUrl = getGoogleSlidesEmbedUrl(url)

  if (viewerType === 'EXTERNAL' || !embedUrl) {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-white/30 mb-2">
              Slide deck
            </p>
            <h4 className="font-semibold text-white mb-1">{title}</h4>
            <div className="flex flex-wrap gap-3 text-xs text-white/35 mb-3">
              <span>{slideCount} slides</span>
            </div>
            {sections.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {sections.map(section => (
                  <span key={section} className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-white/50">
                    {section}
                  </span>
                ))}
              </div>
            )}
          </div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#F5C518] px-4 py-2.5 text-sm font-semibold text-[#0A0A0A] hover:bg-[#FFD020] transition-colors shrink-0"
          >
            Open <ExternalLink size={13} />
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0A0A0A] border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-white/8 px-6 py-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-white truncate">{title}</h3>
            <p className="text-sm text-white/50">{slideCount} slides</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 text-sm text-white transition-colors"
              title="Open in Google Slides"
            >
              <ExternalLink size={16} />
            </a>
            {onClose && (
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 p-2 text-white transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Embed */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allowFullScreen
            title={title}
          />
        </div>
      </div>
    </div>
  )
}

export function SlideViewerButton({
  url,
  title,
  slideCount,
  sections = [],
}: Omit<Props, 'viewerType' | 'onClose'>) {
  const embedUrl = getGoogleSlidesEmbedUrl(url)

  if (!embedUrl) return null

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        // Note: Component doesn't handle state, parent should manage modal state
      }}
      className="inline-flex items-center gap-2 rounded-xl bg-[#F5C518] px-4 py-2.5 text-sm font-semibold text-[#0A0A0A] hover:bg-[#FFD020] transition-colors"
    >
      View Slides
    </button>
  )
}
