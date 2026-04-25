import { Zap } from 'lucide-react'

export default function GamesNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-400 to-cyan-500 flex items-center justify-center">
            <Zap size={13} className="text-white" />
          </div>
          <span className="font-display font-bold text-base">
            Rubikcon <span className="text-violet-400">Games</span>
          </span>
        </a>
        <div className="flex items-center gap-3">
          <a href="http://localhost:3000" className="text-xs text-gray-500 hover:text-white transition-colors hidden sm:block">
            ← Main Site
          </a>
          <a href="http://localhost:3000/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5">Log in</a>
          <a href="http://localhost:3000/signup" className="text-sm bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-4 py-1.5 rounded-lg font-medium hover:opacity-90">
            Sign up
          </a>
        </div>
      </div>
    </nav>
  )
}
