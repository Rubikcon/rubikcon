import { useLocation } from 'wouter'
import { motion } from 'framer-motion'
import { ArrowLeft, Home } from 'lucide-react'
import AcademyNavbar from '../components/AcademyNavbar'
import AcademyFooter from '../components/AcademyFooter'

export default function NotFoundPage() {
  const [, setLocation] = useLocation()

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      <AcademyNavbar solid />

      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-lg mx-auto"
        >
          {/* Error code */}
          <p className="font-mono text-[#F5C518] text-xs tracking-[0.25em] uppercase mb-6">
            Error 404
          </p>

          {/* Large number */}
          <div className="font-display font-extrabold text-[120px] md:text-[160px] leading-none text-white/[0.06] select-none mb-8 -mt-4">
            404
          </div>

          {/* Heading */}
          <h1 className="font-display font-extrabold text-white text-3xl md:text-4xl leading-tight mb-4 -mt-16 md:-mt-20 relative">
            Page not found
          </h1>

          {/* Description */}
          <p className="text-white/45 text-base leading-relaxed mb-10">
            The page you're looking for doesn't exist or may have been moved.
            Check the URL, or head back to explore what we have to offer.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => setLocation('/')}
              className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold px-7 py-3 rounded-full hover:bg-[#E8B800] transition-colors text-sm"
            >
              <Home size={15} />
              Go home
            </button>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 border border-white/15 text-white/70 px-7 py-3 rounded-full hover:border-white/30 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={15} />
              Go back
            </button>
          </div>
        </motion.div>
      </main>

      <AcademyFooter />
    </div>
  )
}
