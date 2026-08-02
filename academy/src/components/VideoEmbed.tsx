import { Film, Play } from 'lucide-react'
import { useState } from 'react'
import EmbedFrame from './EmbedFrame'

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
      // Use autoplay when loading via poster click
      if (id) return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&autoplay=1`
    }
    // Vimeo
    if (u.hostname.includes('vimeo.com')) {
      if (u.hostname.includes('player.vimeo.com')) return url
      const id = u.pathname.replace(/^\//, '').split('/')[0]
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}?dnt=1&autoplay=1`
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
  poster?: string
}

export default function VideoEmbed({ url, title, className = '', poster }: Props) {
  const [isPlaying, setIsPlaying] = useState(!poster)
  const embedUrl = getEmbedUrl(url)

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

  if (!isPlaying && poster) {
    return (
      <div 
        className={`relative cursor-pointer group aspect-video overflow-hidden rounded-xl bg-black ${className}`}
        onClick={() => setIsPlaying(true)}
      >
        <img src={poster} alt={title || "Video thumbnail"} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-[#F5C518] group-hover:border-[#F5C518]/50 group-hover:text-black transition-all transform group-hover:scale-110">
            <Play size={24} className="ml-1" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <EmbedFrame
      src={embedUrl}
      fallbackUrl={url}
      title={title || 'Video player'}
      className={className}
    />
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
