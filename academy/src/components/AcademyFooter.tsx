import {
  ArrowRight,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Phone,
  Twitter,
} from "lucide-react";

/**
 * Site-wide footer. Channels come from the June 2026 content brief (§4.6) —
 * company-owned links only; facilitators' personal LinkedIn profiles live on
 * the Facilitators page. Every external link opens in a new tab.
 */
const CONTACT = {
  email: "rubikconnexus@gmail.com",
  phonePrimary: { label: "+233 535 832843 (Ghana)", tel: "+233535832843" },
  phoneSecondary: {
    label: "+234 810 767 8025 (Nigeria)",
    tel: "+2348107678025",
  },
  telegram: "https://t.me/+UaFYTH7FJt04NzBk",
  linkedin: "https://www.linkedin.com/company/rubicon-consults/",
  instagram: "https://www.instagram.com/rubikcongames",
  x: "https://x.com/Rubiconconsult",
};

/**
 * Official X (formerly Twitter) logo as an inline SVG.
 * Renders at 15×15 to match the other lucide-react social icons.
 */
function XLogo({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.26 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
  { href: "/facilitators", label: "Facilitators" },
  { href: "/contact", label: "Contact" },
];

const ACCOUNT_LINKS = [
  { href: "/login?mode=signup", label: "Sign Up" },
  { href: "/login", label: "Log In" },
  { href: "/dashboard", label: "My Dashboard" },
  { href: "/course/blockchain-social-impact", label: "Featured Programme" },
];

const SOCIALS = [
  { href: CONTACT.telegram, label: "Telegram", Icon: MessageCircle },
  { href: CONTACT.linkedin, label: "LinkedIn", Icon: Linkedin },
  { href: CONTACT.instagram, label: "Instagram", Icon: Instagram },
  { href: CONTACT.x, label: "X (Twitter)", Icon: Twitter },
];

export default function AcademyFooter() {
  return (
    <footer className="bg-[#050505] border-t border-white/8">
      {/* CTA strip */}
      <div className="border-b border-white/8">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-display font-extrabold text-white text-lg sm:text-xl">
              Ready to build your future in tech?
            </p>
            <p className="text-white/40 text-sm mt-0.5">
              Join learners across Africa gaining practical, career-ready
              skills.
            </p>
          </div>
          <a
            href="/login?mode=signup"
            className="shrink-0 inline-flex items-center gap-2 bg-[#F5C518] text-[#0A0A0A] font-bold px-6 py-3 rounded-full hover:bg-[#E8B800] transition-colors text-sm"
          >
            Sign Up <ArrowRight size={14} />
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12 sm:py-14">
        <div className="grid gap-10 sm:gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#F5C518] flex items-center justify-center">
                <span className="font-display font-extrabold text-[#0A0A0A] text-sm leading-none">
                  R
                </span>
              </div>
              <span className="font-display font-bold text-base text-white">
                Rubikcon <span className="text-[#F5C518]">Nexus</span> Academy
              </span>
            </a>
            <p className="text-white/45 text-sm leading-relaxed max-w-sm mb-6">
              Practical, industry-focused training in AI, blockchain, product
              management, and emerging technologies — helping Africans build
              careers, solve meaningful problems, and drive innovation.
            </p>
            <div className="flex items-center gap-3">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  aria-label={label}
                  className="w-10 h-10 rounded-full border border-white/12 flex items-center justify-center text-white/50 hover:text-[#F5C518] hover:border-[#F5C518]/40 hover:bg-[#F5C518]/5 transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-white/35 mb-4">
              Explore
            </p>
            <ul className="space-y-3">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-white/55 hover:text-[#F5C518] transition-colors inline-block py-0.5"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-white/35 mb-4">
              Learners
            </p>
            <ul className="space-y-3">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-white/55 hover:text-[#F5C518] transition-colors inline-block py-0.5"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-white/35 mb-4">
              Get in touch
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="inline-flex items-center gap-2.5 text-white/55 hover:text-[#F5C518] transition-colors py-0.5 break-all"
                >
                  <Mail size={14} className="shrink-0" /> {CONTACT.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${CONTACT.phonePrimary.tel}`}
                  className="inline-flex items-center gap-2.5 text-white/55 hover:text-[#F5C518] transition-colors py-0.5"
                >
                  <Phone size={14} className="shrink-0" />{" "}
                  {CONTACT.phonePrimary.label}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${CONTACT.phoneSecondary.tel}`}
                  className="inline-flex items-center gap-2.5 text-white/55 hover:text-[#F5C518] transition-colors py-0.5"
                >
                  <Phone size={14} className="shrink-0" />{" "}
                  {CONTACT.phoneSecondary.label}
                </a>
              </li>
            </ul>

            <div className="flex items-center gap-3 mt-5">
              {[
                {
                  href: CONTACT.telegram,
                  label: "Telegram community",
                  Icon: MessageCircle,
                },
                { href: CONTACT.linkedin, label: "LinkedIn", Icon: Linkedin },
                {
                  href: CONTACT.instagram,
                  label: "Instagram",
                  Icon: Instagram,
                },
                { href: CONTACT.x, label: "X (formerly Twitter)", Icon: XLogo },
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

        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center sm:justify-between gap-3 text-xs text-white/30 text-center sm:text-left">
          <span>
            © {new Date().getFullYear()} Rubikcon Nexus Academy · Part of
            Rubikcon Nexus · Nigeria
          </span>
          <span>Building Africa's next generation of technology leaders</span>
        </div>
      </div>
    </footer>
  );
}
