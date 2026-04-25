import { Twitter, Instagram, Linkedin, MessageCircle } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const QUICK_LINKS = [
  { label: 'Book a Meeting', href: '/contact' },
  { label: 'Join Community', href: '#' },
  { label: 'Game shop', href: 'http://localhost:3002' },
  { label: 'Blog Site', href: '#' },
]
const SOCIALS = [
  { label: 'Twitter/X', icon: Twitter, href: '#' },
  { label: 'Instagram', icon: Instagram, href: '#' },
  { label: 'LinkedIn', icon: Linkedin, href: '#' },
  { label: 'Discord', icon: MessageCircle, href: '#' },
]

export default function Footer() {
  const { isDark } = useTheme()

  return (
    <footer className={`border-t transition-colors ${isDark ? 'bg-[#0A0A0A] border-[#2A2A2A]' : 'bg-[#F5F0DC] border-[#E0D9C0]'}`}>
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-4 gap-10 mb-10">

          {/* Brand — REPLACE div logo with <img src="/rub.jpg" /> */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-[#F5C518] rounded-md flex items-center justify-center">
                <span className="text-black font-bold text-xs">R</span>
              </div>
              <span className={`font-display font-bold ${isDark ? 'text-white' : 'text-[#0A0A0A]'}`}>Rubikcon</span>
            </div>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-[#888888]' : 'text-[#666666]'}`}>
              Empowering businesses and individuals with scalable Web3 solutions for global impact.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-[#0A0A0A]'}`}>Quick links</h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map(l => (
                <li key={l.label}>
                  <a href={l.href} className={`text-sm transition-colors hover:text-[#F5C518] ${isDark ? 'text-[#888888]' : 'text-[#666666]'}`}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-[#0A0A0A]'}`}>Socials</h4>
            <ul className="space-y-2.5">
              {SOCIALS.map(s => (
                <li key={s.label}>
                  <a href={s.href} className={`flex items-center gap-2 text-sm transition-colors hover:text-[#F5C518] ${isDark ? 'text-[#888888]' : 'text-[#666666]'}`}>
                    <s.icon size={13} /> {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-[#0A0A0A]'}`}>Contacts</h4>
            <div className="space-y-3">
              <div>
                <div className={`text-xs mb-0.5 ${isDark ? 'text-[#888888]' : 'text-[#888888]'}`}>Hot-line:</div>
                <a href="tel:+2338231338932" className={`text-sm transition-colors hover:text-[#F5C518] ${isDark ? 'text-white' : 'text-[#0A0A0A]'}`}>
                  +233-823-133-8932
                </a>
              </div>
              <div>
                <div className={`text-xs mb-0.5 ${isDark ? 'text-[#888888]' : 'text-[#888888]'}`}>Email:</div>
                <a href="mailto:info.rubiconconsulting@gmail.com" className={`text-sm transition-colors hover:text-[#F5C518] break-all ${isDark ? 'text-white' : 'text-[#0A0A0A]'}`}>
                  info.rubiconconsulting@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className={`border-t pt-6 text-center ${isDark ? 'border-[#2A2A2A]' : 'border-[#E0D9C0]'}`}>
          <p className={`text-xs ${isDark ? 'text-[#555555]' : 'text-[#999999]'}`}>
            ©Copyright 2025 RubikconNexus. All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  )
}
