import { Instagram, Linkedin, Mail, MessageCircle, Phone, Twitter } from 'lucide-react'

/**
 * Site-wide footer. Channels come from the June 2026 content brief (§4.6) —
 * company-owned links only; facilitators' personal LinkedIn profiles live on
 * the Facilitators page. Every external link opens in a new tab.
 */
const CONTACT = {
  email: 'rubikconnexus@gmail.com',
  phonePrimary: { label: '+233 535 832843 (Ghana)', tel: '+233535832843' },
  phoneSecondary: { label: '+234 810 767 8025 (Nigeria)', tel: '+2348107678025' },
  telegram: 'https://t.me/+UaFYTH7FJt04NzBk',
  linkedin: 'https://www.linkedin.com/company/rubicon-consults/',
  instagram: 'https://www.instagram.com/rubikcongames',
  x: 'https://x.com/Rubiconconsult',
}

const NAV_LINKS = [
  { href: '/courses', label: 'Courses' },
  { href: '/about', label: 'About' },
  { href: '/facilitators', label: 'Facilitators' },
  { href: '/contact', label: 'Contact' },
  { href: '/login', label: 'Sign in' },
]

export default function AcademyFooter() {
  return (
    <footer className="bg-[#050505] border-t border-white/8 px-6 py-14">
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <a href="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#F5C518] flex items-center justify-center">
                <span className="font-display font-extrabold text-[#0A0A0A] text-sm leading-none">R</span>
              </div>
              <span className="font-display font-bold text-base text-white">
                Rubikcon <span className="text-[#F5C518]">Nexus</span> Academy
              </span>
            </a>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm">
              Practical, industry-focused training in AI, blockchain, product management, and emerging
              technologies — helping Africans build careers, solve meaningful problems, and drive innovation.
            </p>
          </div>

          {/* Explore */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-4">Explore</p>
            <ul className="space-y-2.5">
              {NAV_LINKS.map(link => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-white/50 hover:text-[#F5C518] transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-4">Get in touch</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2 text-white/50 hover:text-[#F5C518] transition-colors">
                  <Mail size={13} /> {CONTACT.email}
                </a>
              </li>
              <li>
                <a href={`tel:${CONTACT.phonePrimary.tel}`} className="inline-flex items-center gap-2 text-white/50 hover:text-[#F5C518] transition-colors">
                  <Phone size={13} /> {CONTACT.phonePrimary.label}
                </a>
              </li>
              <li>
                <a href={`tel:${CONTACT.phoneSecondary.tel}`} className="inline-flex items-center gap-2 text-white/50 hover:text-[#F5C518] transition-colors">
                  <Phone size={13} /> {CONTACT.phoneSecondary.label}
                </a>
              </li>
            </ul>

            <div className="flex items-center gap-3 mt-5">
              {[
                { href: CONTACT.telegram, label: 'Telegram community', Icon: MessageCircle },
                { href: CONTACT.linkedin, label: 'LinkedIn', Icon: Linkedin },
                { href: CONTACT.instagram, label: 'Instagram', Icon: Instagram },
                { href: CONTACT.x, label: 'X (Twitter)', Icon: Twitter },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-white/12 flex items-center justify-center text-white/45 hover:text-[#F5C518] hover:border-[#F5C518]/40 transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/25">
          <span>© {new Date().getFullYear()} Rubikcon Nexus Academy · Part of Rubikcon Nexus · Nigeria</span>
          <span>Founded 2025 · Building Africa's next generation of technology leaders</span>
        </div>
      </div>
    </footer>
  )
}
