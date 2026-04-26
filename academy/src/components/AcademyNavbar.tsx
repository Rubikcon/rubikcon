// import { Zap, ArrowLeft } from 'lucide-react'

// interface NavbarProps {
//   showBack?: boolean
//   backLabel?: string
//   backHref?: string
// }

// export default function AcademyNavbar({ showBack, backLabel = 'Back to Course', backHref = '/course' }: NavbarProps) {
//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-6 py-4">
//       <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           {showBack && (
//             <a href={backHref} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors mr-2">
//               <ArrowLeft size={14} />
//               {backLabel}
//             </a>
//           )}
//           <a href="/" className="flex items-center gap-2">
//             <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
//               <Zap size={13} className="text-white" />
//             </div>
//             <span className="font-display font-bold text-base">
//               Rubikcon <span className="text-cyan-400">Academy</span>
//             </span>
//           </a>
//         </div>
//         <div className="flex items-center gap-3">
//           <a href="http://localhost:3000/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5">Log in</a>
//           <a href="http://localhost:3000/signup" className="text-sm bg-gradient-to-r from-cyan-500 to-violet-500 text-white px-4 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
//             Sign up
//           </a>
//         </div>
//       </div>
//     </nav>
//   )
// }



import { Zap } from 'lucide-react'
import { URLS } from '../config/urls'

interface NavbarProps {
  showBack?: boolean
  backLabel?: string
  backHref?: string
}

export default function AcademyNavbar({ showBack, backLabel = 'Back to Course', backHref = '/course' }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-6 py-4">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack && (
            <a href={backHref} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors mr-2">
              ← {backLabel}
            </a>
          )}
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
              <Zap size={13} className="text-white" />
            </div>
            <span className="font-display font-bold text-base">
              Rubikcon <span className="text-cyan-400">Academy</span>
            </span>
          </a>
        </div>
        <div className="flex items-center gap-3">
          <a href={URLS.landing} className="text-xs text-gray-500 hover:text-white transition-colors hidden sm:block">← Main Site</a>
          <a href={`${URLS.landing}/login`} className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5">Log in</a>
          <a href={`${URLS.landing}/signup`} className="text-sm bg-gradient-to-r from-cyan-500 to-violet-500 text-white px-4 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Sign up
          </a>
        </div>
      </div>
    </nav>
  )
}
