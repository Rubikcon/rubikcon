import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, Gamepad2, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'

export default function RubikconGamesPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl"
          >
            {/* Background decoration */}
            <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-[#F5C518]/20 blur-[80px]" />
            <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-teal-500/10 blur-[80px]" />

            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full bg-white/5 p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors z-10"
            >
              <X size={16} />
            </button>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-[#F5C518]/20 to-[#FFD020]/40 ring-1 ring-[#F5C518]/30">
                <Trophy size={40} className="text-[#F5C518]" />
              </div>

              <h2 className="mb-2 font-display text-2xl font-extrabold text-white">Quiz Passed!</h2>
              <p className="mb-8 text-sm leading-relaxed text-white/60">
                Excellent work! Take a well-deserved break and test your reflexes in Rubikcon Games. Compete on the leaderboard and earn rewards!
              </p>

              <div className="flex w-full flex-col gap-3">
                <a
                  href="/games"
                  target="_blank"
                  rel="noreferrer"
                  className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#F5C518] px-6 py-3.5 text-sm font-bold text-[#0A0A0A] transition-all hover:bg-[#FFD020]"
                >
                  <Gamepad2 size={18} />
                  <span>Play Rubikcon Games</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </a>
                <button
                  onClick={onClose}
                  className="w-full rounded-xl border border-white/10 bg-transparent px-6 py-3.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Continue learning
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
