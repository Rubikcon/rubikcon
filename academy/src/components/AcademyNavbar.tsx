import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { URLS } from '../config/urls'
import { logout, getStoredAuth, isAdmin, isSuperAdmin } from '../lib/auth'

interface NavbarProps {
  showBack?: boolean
  backLabel?: string
  backHref?: string
  dark?: boolean
  solid?: boolean
}

const NAV_LINKS = [
  { href: '/courses', label: 'Courses' },
  { href: '/about', label: 'About' },
  { href: '/facilitators', label: 'Facilitators' },
  { href: '/contact', label: 'Contact' },
]

export default function AcademyNavbar({
  showBack,
  backLabel = 'Back to Course',
  backHref = '/course',
  dark = true,
  solid = false,
}: NavbarProps) {
  const [auth, setAuth] = useState(() => getStoredAuth())
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const syncAuth = () => setAuth(getStoredAuth())
    window.addEventListener('rubikcon-auth-change', syncAuth as EventListener)
    window.addEventListener('storage', syncAuth)
    return () => {
      window.removeEventListener('rubikcon-auth-change', syncAuth as EventListener)
      window.removeEventListener('storage', syncAuth)
    }
  }, [])

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const textColor = dark ? 'text-white' : 'text-[#1C1C1C]'
  const borderColor = dark ? 'border-white/10' : 'border-black/10'
  const bg = solid
    ? 'bg-[#0A0A0A]/95 backdrop-blur-md'
    : dark ? 'bg-[#0A0A0A]/80 backdrop-blur-md' : 'bg-[#F2EDE2]'
  const hoverColor = dark ? 'hover:text-[#F5C518]' : 'hover:text-[#C49A00]'
  const secondaryButton = dark
    ? 'border-white/30 text-white hover:border-white'
    : 'border-black/30 text-[#1C1C1C] hover:border-black'

  const dashboardHref = isAdmin()
    ? (isSuperAdmin() ? '/admin/superadmin' : '/admin/academy')
    : '/dashboard'
  const dashboardLabel = isAdmin()
    ? (isSuperAdmin() ? 'Super Admin' : 'Admin Dashboard')
    : 'Dashboard'

  async function handleLogout() {
    await logout()
    window.location.href = '/login'
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${bg} border-b ${borderColor}`}>
      <div className="px-4 sm:px-6 py-3.5 sm:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-8 min-w-0">
            {showBack ? (
              <a href={backHref} className={`flex items-center gap-1.5 text-sm transition-colors ${textColor} ${hoverColor}`}>
                ← {backLabel}
              </a>
            ) : (
              <>
                <a href="/" className="flex items-center gap-2.5 shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-[#F5C518] flex items-center justify-center">
                    <span className="font-display font-extrabold text-[#0A0A0A] text-sm leading-none">R</span>
                  </div>
                  <span className={`font-display font-bold text-base ${textColor}`}>
                    Rubikcon <span className="text-[#F5C518]">Nexus</span>
                  </span>
                </a>

                <div className="hidden md:flex items-center gap-6">
                  {NAV_LINKS.map(link => (
                    <a key={link.href} href={link.href} className={`text-sm transition-all ${textColor} opacity-70 hover:opacity-100 ${hoverColor}`}>
                      {link.label}
                    </a>
                  ))}
                  {auth && (
                    <a href="/dashboard" className={`text-sm transition-all ${textColor} opacity-70 hover:opacity-100 ${hoverColor}`}>Dashboard</a>
                  )}
                  <a href={URLS.landing} className={`text-sm transition-all ${textColor} opacity-70 hover:opacity-100 ${hoverColor}`}>Main site</a>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {auth ? (
              <>
                <span className="hidden lg:inline text-sm text-white/55 max-w-[180px] truncate">
                  {auth.user.name || auth.user.email}
                </span>
                <a
                  href={dashboardHref}
                  className={`hidden md:inline-flex text-sm px-4 py-1.5 rounded-full border transition-all ${secondaryButton}`}
                >
                  {dashboardLabel}
                </a>
                <button
                  onClick={handleLogout}
                  className="hidden md:inline-flex text-sm px-4 py-1.5 rounded-full bg-[#F5C518] text-[#0A0A0A] font-semibold hover:bg-[#E8B800] transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className={`hidden sm:inline-flex text-sm px-4 py-1.5 rounded-full border transition-all ${secondaryButton}`}
                >
                  Log in
                </a>
                <a
                  href="/login?mode=signup"
                  className="text-sm px-4 py-1.5 rounded-full bg-[#F5C518] text-[#0A0A0A] font-semibold hover:bg-[#E8B800] transition-colors whitespace-nowrap"
                >
                  Sign up
                </a>
              </>
            )}

            {/* Hamburger — always rendered on mobile so navigation is never unreachable */}
            {!showBack && (
              <button
                onClick={() => setMobileOpen(o => !o)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                className={`md:hidden inline-flex items-center justify-center w-10 h-10 -mr-1 rounded-xl border transition-colors ${
                  dark ? 'border-white/15 text-white hover:border-white/40' : 'border-black/15 text-[#1C1C1C] hover:border-black/40'
                }`}
              >
                {mobileOpen ? <X size={19} /> : <Menu size={19} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {!showBack && mobileOpen && (
        <div className={`md:hidden border-t ${borderColor} ${dark ? 'bg-[#0A0A0A]/98' : 'bg-[#F2EDE2]'} backdrop-blur-xl max-h-[calc(100vh-64px)] overflow-y-auto`}>
          <div className="px-4 py-4 flex flex-col">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-3.5 rounded-xl text-[15px] font-medium transition-colors ${textColor} ${
                  dark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.05]'
                }`}
              >
                {link.label}
              </a>
            ))}
            {auth && (
              <a
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-3.5 rounded-xl text-[15px] font-medium transition-colors ${textColor} ${
                  dark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.05]'
                }`}
              >
                Dashboard
              </a>
            )}
            <a
              href={URLS.landing}
              onClick={() => setMobileOpen(false)}
              className={`px-3 py-3.5 rounded-xl text-[15px] font-medium transition-colors ${textColor} ${
                dark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.05]'
              }`}
            >
              Main site
            </a>

            <div className={`mt-3 pt-4 border-t ${borderColor} flex flex-col gap-2.5`}>
              {auth ? (
                <>
                  <p className={`px-3 text-xs ${dark ? 'text-white/45' : 'text-black/45'} truncate`}>
                    Signed in as {auth.user.name || auth.user.email}
                  </p>
                  <a
                    href={dashboardHref}
                    onClick={() => setMobileOpen(false)}
                    className={`text-center text-sm px-4 py-3 rounded-full border transition-all ${secondaryButton}`}
                  >
                    {dashboardLabel}
                  </a>
                  <button
                    onClick={handleLogout}
                    className="text-sm px-4 py-3 rounded-full bg-[#F5C518] text-[#0A0A0A] font-semibold hover:bg-[#E8B800] transition-colors"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/login?mode=signup"
                    onClick={() => setMobileOpen(false)}
                    className="text-center text-sm px-4 py-3 rounded-full bg-[#F5C518] text-[#0A0A0A] font-semibold hover:bg-[#E8B800] transition-colors"
                  >
                    Sign up — it's free
                  </a>
                  <a
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className={`text-center text-sm px-4 py-3 rounded-full border transition-all ${secondaryButton}`}
                  >
                    Log in
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
