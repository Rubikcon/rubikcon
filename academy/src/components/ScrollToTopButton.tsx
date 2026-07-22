import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

const THRESHOLD = 300

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll(e?: Event) {
      let targetScroll = 0
      if (e?.target && e.target instanceof Element) {
        targetScroll = e.target.scrollTop || 0
      } else if (e?.target === document) {
        targetScroll = document.documentElement.scrollTop || document.body.scrollTop || 0
      }

      const winScroll = window.scrollY || window.pageYOffset || 0
      const docScroll = document.documentElement.scrollTop || document.body.scrollTop || 0
      const rootScroll = document.getElementById('root')?.scrollTop || 0
      
      const maxScroll = Math.max(winScroll, docScroll, rootScroll, targetScroll)
      setVisible(maxScroll > THRESHOLD)
    }

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true })
    
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll, { capture: true })
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const root = document.getElementById('root')
    if (root) root.scrollTo({ top: 0, behavior: 'smooth' })
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
    
    // Also try to scroll the first scrollable container if any exists
    const scrollableContainers = document.querySelectorAll('.overflow-y-auto, .overflow-auto')
    scrollableContainers.forEach(container => {
      container.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[9999] w-12 h-12 rounded-full bg-[#F5C518] text-[#0A0A0A] flex items-center justify-center shadow-[0_4px_24px_rgba(245,197,24,0.35)] hover:bg-[#E8B800] transition-all duration-300 ease-out ${
        visible ? 'opacity-100 translate-y-0 visible pointer-events-auto' : 'opacity-0 translate-y-8 invisible pointer-events-none'
      }`}
    >
      <ArrowUp size={20} strokeWidth={2.5} color="#0A0A0A" />
    </button>
  )
}

