// import { Zap, PlusCircle } from 'lucide-react'

// export default function BlockGigsNavbar() {
//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-6 py-4">
//       <div className="max-w-7xl mx-auto flex items-center justify-between">
//         <a href="/" className="flex items-center gap-2">
//           <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
//             <Zap size={13} className="text-white" />
//           </div>
//           <span className="font-display font-bold text-base">
//             Block<span className="text-amber-400">Gigs</span>
//           </span>
//         </a>
//         <div className="flex items-center gap-3">
//           <a href="http://localhost:3000" className="text-xs text-gray-500 hover:text-white transition-colors hidden sm:block">← Rubikcon</a>
//           <a href="http://localhost:3000/login" className="text-sm text-gray-400 hover:text-white px-3 py-1.5 transition-colors">Log in</a>
//           <button className="flex items-center gap-1.5 text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
//             <PlusCircle size={13} /> Post Gig
//           </button>
//         </div>
//       </div>
//     </nav>
//   )
// }



import { Zap, PlusCircle } from 'lucide-react'
import { URLS } from '../config/urls'

export default function BlockGigsNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Zap size={13} className="text-white" />
          </div>
          <span className="font-display font-bold text-base">
            Block<span className="text-amber-400">Gigs</span>
          </span>
        </a>
        <div className="flex items-center gap-3">
          <a href={URLS.landing} className="text-xs text-gray-500 hover:text-white transition-colors hidden sm:block">← Rubikcon</a>
          <a href={`${URLS.landing}/login`} className="text-sm text-gray-400 hover:text-white px-3 py-1.5 transition-colors">Log in</a>
          <button className="flex items-center gap-1.5 text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
            <PlusCircle size={13} /> Post Gig
          </button>
        </div>
      </div>
    </nav>
  )
}
