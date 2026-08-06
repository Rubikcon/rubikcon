import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { URLS } from "../config/urls";
import { logout, getStoredAuth, isAdmin, isSuperAdmin } from "../lib/auth";

interface NavbarProps {
  showBack?: boolean;
  backLabel?: string;
  backHref?: string;
  dark?: boolean;
  solid?: boolean;
}

const NAV_LINKS = [
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
  { href: "/facilitators", label: "Facilitators" },
  { href: "/facilitator/apply", label: "Apply to Teach" },
] as const;

export default function AcademyNavbar({
  showBack,
  backLabel = "Back to Course",
  backHref = "/course",
  dark = true,
  solid = false,
}: NavbarProps) {
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync auth state across tabs
  useEffect(() => {
    const syncAuth = () => setAuth(getStoredAuth());
    window.addEventListener("rubikcon-auth-change", syncAuth as EventListener);
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener(
        "rubikcon-auth-change",
        syncAuth as EventListener,
      );
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  // Handle scroll state
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initialize state
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle mobile menu side effects (scroll lock and Escape key)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    } else {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const textColor = dark ? "text-white" : "text-[#1C1C1C]";
  const borderColor = scrolled
    ? dark
      ? "border-white/10"
      : "border-black/8"
    : "border-transparent";

  // Background: solid prop overrides scroll-aware behaviour (used on inner pages
  // where the navbar is always opaque). Otherwise transition on scroll.
  const bg = solid
    ? "bg-[#0A0A0A]/95 backdrop-blur-md"
    : scrolled
      ? "bg-[#0A0A0A]/95 backdrop-blur-md"
      : dark
        ? "bg-transparent"
        : "bg-[#F2EDE2]";
  const hoverColor = dark ? "hover:text-[#F5C518]" : "hover:text-[#C49A00]";
  const secondaryButton = dark
    ? "border-white/30 text-white hover:border-white"
    : "border-black/30 text-[#1C1C1C] hover:border-black";

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location === href || location.startsWith(`${href}/`);
  };

  // Active link style for desktop nav
  const desktopLinkClass = (href: string) => {
    const active = isActive(href);
    return [
      "text-sm transition-all",
      active
        ? `${dark ? "text-[#F5C518]" : "text-[#C49A00]"} opacity-100 font-medium`
        : `${textColor} opacity-60 hover:opacity-100 ${hoverColor}`,
    ].join(" ");
  };

  // Active link style for mobile menu
  const mobileLinkClass = (href: string) => {
    const active = isActive(href);
    return [
      "flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all",
      active
        ? "bg-[#F5C518]/10 text-[#F5C518]"
        : "text-white/70 hover:bg-white/5 hover:text-white",
    ].join(" ");
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 ${bg} border-b ${borderColor} px-6 py-4 transition-all duration-300 ease-in-out`}
        aria-label="Main navigation"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* ─── Left: Logo / Back ────────────────────────────────────── */}
          <div className="flex items-center gap-8 min-w-0">
            {showBack ? (
              <a
                href={backHref}
                className={`flex items-center gap-1.5 text-sm transition-colors ${textColor} ${hoverColor}`}
              >
                ← {backLabel}
              </a>
            ) : (
              <>
                {/* Logo */}
                <a
                  href="/"
                  className="flex items-center gap-2.5 shrink-0"
                  aria-label="Rubikcon Nexus Academy home"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#F5C518] flex items-center justify-center">
                    <span className="font-display font-extrabold text-[#0A0A0A] text-sm leading-none">
                      R
                    </span>
                  </div>
                  <span
                    className={`font-display font-bold text-base ${textColor}`}
                  >
                    Rubikcon <span className="text-[#F5C518]">Nexus</span>
                  </span>
                </a>

                {/* Desktop nav links */}
                <div className="hidden md:flex items-center gap-6" role="list">
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className={desktopLinkClass(link.href)}
                      aria-current={isActive(link.href) ? "page" : undefined}
                    >
                      {link.label}
                    </a>
                  ))}
                  {auth && (
                    <a
                      href="/dashboard"
                      className={desktopLinkClass("/dashboard")}
                      aria-current={isActive("/dashboard") ? "page" : undefined}
                    >
                      Dashboard
                    </a>
                  )}
                  <a
                    href={URLS.landing}
                    className={`text-sm transition-all ${textColor} opacity-60 hover:opacity-100 ${hoverColor}`}
                  >
                    Main site
                  </a>
                </div>
              </>
            )}
          </div>

          {/* ─── Right: Auth + Hamburger ──────────────────────────────── */}
          <div className="flex items-center gap-3">
            {/* Auth buttons — always visible */}
            {auth ? (
              <>
                <span className="hidden md:inline text-sm text-white/55 truncate max-w-[140px]">
                  {auth.user.name || auth.user.email}
                </span>
                {isAdmin() ? (
                  <a
                    href={
                      isSuperAdmin() ? "/admin/superadmin" : "/admin/academy"
                    }
                    className={`hidden md:inline-flex text-sm px-4 py-1.5 rounded-full border transition-all ${secondaryButton}`}
                  >
                    {isSuperAdmin() ? "Super Admin" : "Admin"}
                  </a>
                ) : (
                  <a
                    href="/dashboard"
                    className={`hidden md:inline-flex text-sm px-4 py-1.5 rounded-full border transition-all ${secondaryButton}`}
                  >
                    Dashboard
                  </a>
                )}
                <button
                  onClick={async () => {
                    await logout();
                    window.location.href = "/login";
                  }}
                  className="hidden md:inline-flex text-sm px-4 py-1.5 rounded-full bg-[#F5C518] text-[#0A0A0A] font-semibold hover:bg-[#E8B800] transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className={`hidden md:inline-flex text-sm px-4 py-1.5 rounded-full border transition-all ${secondaryButton}`}
                >
                  Log in
                </a>
                <a
                  href="/login?mode=signup"
                  className="hidden md:inline-flex text-sm px-4 py-1.5 rounded-full bg-[#F5C518] text-[#0A0A0A] font-semibold hover:bg-[#E8B800] transition-colors"
                >
                  Sign up
                </a>
              </>
            )}

            {/* Hamburger button — mobile only, hidden when showBack */}
            {!showBack && (
              <button
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-all"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label={
                  menuOpen ? "Close navigation menu" : "Open navigation menu"
                }
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Mobile Menu Overlay + Drawer ─────────────────────────────── */}
      {!showBack && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
              menuOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer */}
          <div
            id="mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-label="Navigation menu"
            aria-modal="true"
            className={`fixed top-0 right-0 bottom-0 z-50 w-[min(320px,90vw)] bg-[#111111] border-l border-white/10 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
              menuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <a
                href="/"
                className="flex items-center gap-2.5"
                onClick={() => setMenuOpen(false)}
              >
                <div className="w-7 h-7 rounded-md bg-[#F5C518] flex items-center justify-center">
                  <span className="font-display font-extrabold text-[#0A0A0A] text-xs leading-none">
                    R
                  </span>
                </div>
                <span className="font-display font-bold text-sm text-white">
                  Rubikcon <span className="text-[#F5C518]">Nexus</span>
                </span>
              </a>
              <button
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-all"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={mobileLinkClass(link.href)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              {auth && (
                <a
                  href="/dashboard"
                  className={mobileLinkClass("/dashboard")}
                  aria-current={isActive("/dashboard") ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </a>
              )}
              <a
                href={URLS.landing}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all"
                onClick={() => setMenuOpen(false)}
              >
                Main site
              </a>
            </nav>

            {/* Auth section at bottom */}
            <div className="px-3 py-4 border-t border-white/8 space-y-2">
              {auth ? (
                <>
                  <div className="px-4 py-2.5 rounded-xl bg-white/5">
                    <p className="text-xs text-white/40 mb-0.5">Signed in as</p>
                    <p className="text-sm text-white font-medium truncate">
                      {auth.user.name || auth.user.email}
                    </p>
                  </div>
                  {isAdmin() && (
                    <a
                      href={
                        isSuperAdmin() ? "/admin/superadmin" : "/admin/academy"
                      }
                      className="flex items-center justify-center w-full px-4 py-3 rounded-xl border border-white/20 text-white text-sm font-medium hover:border-white/40 transition-all"
                      onClick={() => setMenuOpen(false)}
                    >
                      {isSuperAdmin() ? "Super Admin" : "Admin panel"}
                    </a>
                  )}
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await logout();
                      window.location.href = "/login";
                    }}
                    className="flex items-center justify-center w-full px-4 py-3 rounded-xl bg-white/8 text-white/70 text-sm font-medium hover:bg-white/12 hover:text-white transition-all"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/login"
                    className="flex items-center justify-center w-full px-4 py-3 rounded-xl border border-white/20 text-white text-sm font-medium hover:border-white/40 transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    Log in
                  </a>
                  <a
                    href="/login?mode=signup"
                    className="flex items-center justify-center w-full px-4 py-3 rounded-xl bg-[#F5C518] text-[#0A0A0A] text-sm font-bold hover:bg-[#E8B800] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign up free
                  </a>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
