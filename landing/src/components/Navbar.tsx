import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight, Sun, Moon } from 'lucide-react'
import { useLocation } from 'wouter'
import { useTheme } from '../context/ThemeContext'
import { URLS } from '../config/urls'

const NAV_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Academy', href: URLS.academy, external: true},
  { label: 'Products', href: '/products' },
  { label: 'Projects', href: '/projects' },
  { label: 'Contact Us', href: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [location] = useLocation()
  const { isDark, toggle } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location])

  const navBg = scrolled
    ? isDark
      ? 'bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#2A2A2A]'
      : 'bg-white/95 backdrop-blur-md border-b border-[#E0D9C0]'
    : 'bg-transparent'

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* ── Announcement Bar ─────────────────────────────── */}
      <div className={`py-2 px-6 text-center text-xs transition-colors ${isDark ? 'bg-[#111111] border-b border-[#2A2A2A] text-[#CCCCCC]' : 'bg-[#F5F0DC] border-b border-[#E0D9C0] text-[#555555]'}`}>
        We have a collection of Games available&nbsp;
        <a href={URLS.games}
          className="text-[#F5C518] underline underline-offset-2 hover:text-[#C9A800] transition-colors font-medium">
          Visit our Game Shop
        </a>
      </div>

      {/* ── Main Nav ─────────────────────────────────────── */}
      <nav className={`transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo — REPLACE inner div with: <img src="/logo.jpg" alt="Rubikcon" className="h-8" /> */}
          <a href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-[#F5C518] rounded-md flex items-center justify-center">
              <span className="text-black font-bold text-sm font-mono">R</span>
            </div>
            <span className={`font-display font-bold text-lg ${isDark ? 'text-white' : 'text-[#0A0A0A]'}`}>
              Rubik<span className="text-[#F5C518]">con</span>
            </span>
          </a>

          {/* Desktop Links */}
          {/* <div className="hidden md:flex items-center gap-8"> */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <a key={link.href} href={link.href}
                className={`text-sm font-medium transition-colors ${
                  location === link.href
                    ? 'text-[#F5C518]'
                    : isDark
                      ? 'text-[#CCCCCC] hover:text-white'
                      : 'text-[#444444] hover:text-[#0A0A0A]'
                }`}>
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side: theme toggle + CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme toggle */}
            <button onClick={toggle}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isDark
                  ? 'bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5C518] hover:border-[#F5C518]/50'
                  : 'bg-[#F5F0DC] border border-[#E0D9C0] text-[#C9A800] hover:border-[#C9A800]'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <a href="/contact" className="btn-gold">
              Book a Meeting <ArrowRight size={14} />
            </a>
          </div>

          {/* Mobile: toggle + menu */}
          {/* <div className="md:hidden flex items-center gap-2"> */}
          <div className="lg:hidden flex items-center gap-2">

            <button onClick={toggle}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-[#1A1A1A] text-[#F5C518]' : 'bg-[#F5F0DC] text-[#C9A800]'}`}>
              {isDark ? <Sun size={13} /> : <Moon size={13} />}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className={isDark ? 'text-white' : 'text-[#0A0A0A]'}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={isDark ? 'lg:hidden bg-[#111111] border-t border-[#2A2A2A]' : 'lg:hidden bg-white border-t border-[#E0D9C0]'}>
              <div className="px-6 py-5 flex flex-col gap-3">
                {NAV_LINKS.map(link => (
                  <a key={link.href} href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                    className={`text-sm font-medium py-2 border-b ${
                      location === link.href ? 'text-[#F5C518]' : isDark ? 'text-[#CCCCCC] border-[#2A2A2A]' : 'text-[#444444] border-[#E0D9C0]'
                    }`}>
                    {link.label}
                  </a>
                ))}
                <a href="/contact" className="btn-gold mt-2 justify-center">Book a Meeting</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  )
}
