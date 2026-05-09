import { useEffect, useState } from 'react'
import { URLS } from '../config/urls'
import { clearStoredAuth, getStoredAuth, isAdmin, isSuperAdmin } from '../lib/auth'

interface NavbarProps {
  showBack?: boolean
  backLabel?: string
  backHref?: string
  dark?: boolean
  solid?: boolean
}

export default function AcademyNavbar({
  showBack,
  backLabel = 'Back to Course',
  backHref = '/course',
  dark = true,
  solid = false,
}: NavbarProps) {
  const [auth, setAuth] = useState(() => getStoredAuth())

  useEffect(() => {
    const syncAuth = () => setAuth(getStoredAuth())
    window.addEventListener('rubikcon-auth-change', syncAuth as EventListener)
    window.addEventListener('storage', syncAuth)
    return () => {
      window.removeEventListener('rubikcon-auth-change', syncAuth as EventListener)
      window.removeEventListener('storage', syncAuth)
    }
  }, [])

  const textColor = dark ? 'text-white' : 'text-[#1C1C1C]'
  const borderColor = dark ? 'border-white/10' : 'border-black/10'
  const bg = solid
    ? 'bg-[#0A0A0A]/95 backdrop-blur-md'
    : dark ? 'bg-transparent' : 'bg-[#F2EDE2]'
  const hoverColor = dark ? 'hover:text-[#F5C518]' : 'hover:text-[#C49A00]'
  const secondaryButton = dark
    ? 'border-white/30 text-white hover:border-white'
    : 'border-black/30 text-[#1C1C1C] hover:border-black'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${bg} border-b ${borderColor} px-6 py-4`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-8 min-w-0">
          {showBack ? (
            <a href={backHref} className={`flex items-center gap-1.5 text-sm transition-colors ${textColor} ${hoverColor}`}>
              ← {backLabel}
            </a>
          ) : (
            <>
              <a href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F5C518] flex items-center justify-center">
                  <span className="font-display font-extrabold text-[#0A0A0A] text-sm leading-none">R</span>
                </div>
                <span className={`font-display font-bold text-base ${textColor}`}>
                  Rubikcon <span className="text-[#F5C518]">Nexus</span>
                </span>
              </a>

              <div className="hidden md:flex items-center gap-6">
                <a href="/courses" className={`text-sm transition-all ${textColor} opacity-70 hover:opacity-100 ${hoverColor}`}>Courses</a>
                <a href="/dashboard" className={`text-sm transition-all ${textColor} opacity-70 hover:opacity-100 ${hoverColor}`}>Dashboard</a>
                <a href={URLS.landing} className={`text-sm transition-all ${textColor} opacity-70 hover:opacity-100 ${hoverColor}`}>Main site</a>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {auth ? (
            <>
              <span className="hidden md:inline text-sm text-white/55">
                {auth.user.name || auth.user.email}
              </span>
              {isAdmin() ? (
                <a
                  href={isSuperAdmin() ? '/admin/superadmin' : '/admin/academy'}
                  className={`text-sm px-4 py-1.5 rounded-full border transition-all ${secondaryButton}`}
                >
                  {isSuperAdmin() ? 'Super Admin' : 'Dashboard'}
                </a>
              ) : (
                <a
                  href="/dashboard"
                  className={`text-sm px-4 py-1.5 rounded-full border transition-all ${secondaryButton}`}
                >
                  Dashboard
                </a>
              )}
              <button
                onClick={() => {
                  clearStoredAuth()
                  window.location.href = '/login'
                }}
                className="text-sm px-4 py-1.5 rounded-full bg-[#F5C518] text-[#0A0A0A] font-semibold hover:bg-[#E8B800] transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className={`text-sm px-4 py-1.5 rounded-full border transition-all ${secondaryButton}`}
              >
                Log in
              </a>
              <a
                href="/login?mode=signup"
                className="text-sm px-4 py-1.5 rounded-full bg-[#F5C518] text-[#0A0A0A] font-semibold hover:bg-[#E8B800] transition-colors"
              >
                Sign up
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
