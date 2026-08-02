import { useState, useEffect } from 'react'
import { useRoute } from 'wouter'
import { apiRequest } from '../lib/api'
import { ArrowRight, Loader2 } from 'lucide-react'
import AcademyNavbar from '../components/AcademyNavbar'
import { getEmbedUrl } from '../components/VideoEmbed'
import EmbedFrame from '../components/EmbedFrame'
import HtmlVideoPlayer from '../components/HtmlVideoPlayer'
import SlideViewer, { getGoogleSlidesEmbedUrl } from '../components/SlideViewer'

type SharedVideoData = {
  video: {
    id: string
    title: string
    url: string
    description: string | null
    position: number
  }
  week: {
    id: string
    slug: string
    title: string
    number: number
    module: { title: string } | null
  }
  course: {
    id: string
    slug: string
    title: string
  }
  facilitators: Array<{
    name: string
    title: string
    organization: string
    photoUrl: string | null
  }>
}

export default function SharedVideoPage() {
  const [, params] = useRoute('/share/course/:courseSlug/week/:weekSlug/video/:videoId')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<SharedVideoData | null>(null)

  useEffect(() => {
    if (!params?.courseSlug || !params?.weekSlug || !params?.videoId) {
      setError('Invalid link parameters.')
      setLoading(false)
      return
    }

    apiRequest<SharedVideoData>(
      `/academy/public/courses/${params.courseSlug}/weeks/${params.weekSlug}/videos/${params.videoId}`
    )
      .then((res) => {
        setData(res)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Failed to load video.')
        setLoading(false)
      })
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AcademyNavbar showBack backHref="/" backLabel="Home" solid />
        <div className="pt-32 flex flex-col items-center justify-center text-center px-6">
          <Loader2 className="animate-spin text-[#F5C518] mb-4" size={28} />
          <p className="text-white/60">Loading video...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <AcademyNavbar showBack backHref="/" backLabel="Home" solid />
        <div className="pt-32 max-w-xl mx-auto px-6 text-center">
          <h1 className="font-display text-3xl font-extrabold text-white mb-3">Video unavailable</h1>
          <p className="text-white/55 mb-8">{error || 'The video you are looking for does not exist or has been removed.'}</p>
          <a href="/" className="inline-flex items-center gap-2 bg-white text-black font-semibold rounded-full px-6 py-3 text-sm hover:bg-white/90 transition-colors">
            Explore Academy <ArrowRight size={16} />
          </a>
        </div>
      </div>
    )
  }

  const slideEmbedSrc = getGoogleSlidesEmbedUrl(data.video.url)
  const videoEmbedSrc = getEmbedUrl(data.video.url)

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      <AcademyNavbar showBack backHref="/" backLabel="Home" solid />

      <main className="flex-1 flex flex-col pt-[72px]">
        {/* Video Player Area */}
        <div className="w-full bg-black border-b border-white/[0.07]">
          <div className="max-w-6xl mx-auto w-full aspect-video">
            {slideEmbedSrc ? (
              <SlideViewer
                url={data.video.url}
                title={data.video.title}
                slideCount={0}
                viewerType="INLINE"
              />
            ) : videoEmbedSrc ? (
              <EmbedFrame
                src={videoEmbedSrc}
                title={data.video.title}
                fallbackUrl={data.video.url}
                className="rounded-none h-full w-full border-0"
              />
            ) : (
              <HtmlVideoPlayer
                src={data.video.url}
                title={data.video.title}
              />
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 grid gap-12 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F5C518] mb-4">
              <span>{data.course.title}</span>
              <span className="text-white/20">·</span>
              <span>{data.week.title}</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-4">
              {data.video.title}
            </h1>
            {data.video.description && (
              <p className="text-lg text-white/70 leading-relaxed max-w-3xl mb-8">
                {data.video.description}
              </p>
            )}

            {data.facilitators?.length > 0 && (
              <div className="mt-12 pt-12 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-6">Taught by</h3>
                <div className="flex flex-wrap gap-6">
                  {data.facilitators.map((f, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 pr-6">
                      {f.photoUrl ? (
                        <img src={f.photoUrl} alt={f.name} className="w-12 h-12 rounded-full object-cover border border-white/10 bg-black" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#F5C518]/15 text-[#F5C518] flex items-center justify-center font-bold text-base">
                          {f.name.split(' ').map(p => p[0]).join('').slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-white text-sm">{f.name}</p>
                        <p className="text-xs text-white/50">{f.title}{f.organization && `, ${f.organization}`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside>
            <div className="sticky top-[100px] bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
              <h3 className="font-display text-xl font-bold text-white mb-3">
                Unlock the full course
              </h3>
              <p className="text-sm text-white/60 mb-6 leading-relaxed">
                This video is a preview from <strong>{data.course.title}</strong>. Enrol to access the full curriculum, interactive quizzes, assignments, and expert feedback.
              </p>
              <a
                href={`/course/${data.course.slug}`}
                className="flex items-center justify-center gap-2 w-full bg-[#F5C518] text-[#0A0A0A] font-bold py-3.5 px-4 rounded-xl hover:bg-[#F5C518]/90 transition-colors"
              >
                Start Learning <ArrowRight size={18} />
              </a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
