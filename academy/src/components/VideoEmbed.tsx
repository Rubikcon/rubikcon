import { Film, Play } from 'lucide-react'

export type SupportedVideoSource = 'youtube' | 'vimeo' | 'loom' | 'google-drive' | 'unknown'

export function getVideoSource(url: string): SupportedVideoSource {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) return 'youtube'
    if (u.hostname.includes('vimeo.com')) return 'vimeo'
    if (u.hostname.includes('loom.com')) return 'loom'
    if (u.hostname.includes('drive.google.com')) return 'google-drive'
    return 'unknown'
  } catch {
    return 'unknown'
  }
}

export function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    // YouTube
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      if (u.pathname.startsWith('/embed/')) return url
      const id = u.hostname.includes('youtu.be')
        ? u.pathname.slice(1).split('?')[0]
        : (u.searchParams.get('v') ?? u.pathname.split('/').pop())
      if (id) return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`
    }
    // Vimeo
    if (u.hostname.includes('vimeo.com')) {
      if (u.hostname.includes('player.vimeo.com')) return url
      const id = u.pathname.replace(/^\//, '').split('/')[0]
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}?dnt=1`
    }
    // Loom
    if (u.hostname.includes('loom.com')) {
      if (u.pathname.startsWith('/embed/')) return url
      if (u.pathname.startsWith('/share/')) {
        const id = u.pathname.split('/share/')[1]?.split('?')[0]
        if (id) return `https://www.loom.com/embed/${id}`
      }
    }
    // Google Drive
    if (u.hostname.includes('drive.google.com') && u.pathname.includes('/file/d/')) {
      const fileId = u.pathname.split('/file/d/')[1]?.split('/')[0]
      if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`
    }
    return null
  } catch {
    return null
  }
}

type Props = {
  url: string
  title?: string
  className?: string
}

export default function VideoEmbed({ url, title, className = '' }: Props) {
  const embedUrl = getEmbedUrl(url)
  const source = getVideoSource(url)

  if (!embedUrl) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-black/20 p-8 ${className}`}>
        <Film size={32} className="text-white/30" />
        <div className="text-center">
          <p className="text-sm text-white/60">Unable to load video</p>
          <a href={url} target="_blank" rel="noreferrer" className="text-xs text-[#F5C518] hover:underline mt-1">
            Open in new tab
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative w-full bg-black rounded-xl overflow-hidden ${className}`}>
      <div className="relative pt-[56.25%]">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={title || 'Video player'}
        />
      </div>
    </div>
  )
}

type BadgeProps = {
  url: string
  className?: string
}

export function VideoSourceBadge({ url, className = '' }: BadgeProps) {
  const source = getVideoSource(url)

  const badges: Record<SupportedVideoSource, { label: string; color: string }> = {
    youtube: { label: 'YouTube', color: 'bg-red-500/20 text-red-300' },
    vimeo: { label: 'Vimeo', color: 'bg-blue-500/20 text-blue-300' },
    loom: { label: 'Loom', color: 'bg-purple-500/20 text-purple-300' },
    'google-drive': { label: 'Google Drive', color: 'bg-yellow-500/20 text-yellow-300' },
    unknown: { label: 'Video', color: 'bg-white/10 text-white/60' },
  }

  const badge = badges[source]

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${badge.color} ${className}`}>
      <Play size={10} />
      {badge.label}
    </span>
  )
}
