import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiRequest } from '../lib/api'
import { getStoredAuth, setStoredAuth } from '../lib/auth'

// ─── Data ─────────────────────────────────────────────────────────────────────

const USER_ROLES = [
  { value: 'student', label: 'Student', icon: '🎓' },
  { value: 'developer', label: 'Developer', icon: '💻' },
  { value: 'designer', label: 'Designer', icon: '🎨' },
  { value: 'business', label: 'Business / Non-tech', icon: '💼' },
  { value: 'founder', label: 'Founder', icon: '🚀' },
  { value: 'other', label: 'Other', icon: '✨' },
]

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const COUNTRIES = [
  // Africa first
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Ethiopia', 'Tanzania', 'Uganda', 'Rwanda',
  'Senegal', 'Cameroon', 'Côte d\'Ivoire', 'Mali', 'Burkina Faso', 'Niger', 'Guinea',
  'Benin', 'Togo', 'Sierra Leone', 'Liberia', 'Gambia', 'Guinea-Bissau', 'Cape Verde',
  'Mauritania', 'Morocco', 'Algeria', 'Tunisia', 'Libya', 'Egypt', 'Sudan', 'South Sudan',
  'Somalia', 'Djibouti', 'Eritrea', 'Mozambique', 'Zimbabwe', 'Zambia', 'Malawi',
  'Botswana', 'Namibia', 'Lesotho', 'Eswatini', 'Madagascar', 'Mauritius', 'Comoros',
  'Seychelles', 'Angola', 'Democratic Republic of Congo', 'Republic of Congo', 'Gabon',
  'Equatorial Guinea', 'São Tomé and Príncipe', 'Central African Republic', 'Chad',
  // Rest of world
  'Afghanistan', 'Albania', 'Andorra', 'Antigua and Barbuda', 'Argentina', 'Armenia',
  'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados',
  'Belarus', 'Belgium', 'Belize', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina',
  'Brazil', 'Brunei', 'Bulgaria', 'Cambodia', 'Canada', 'Chile', 'China', 'Colombia',
  'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Dominica',
  'Dominican Republic', 'Ecuador', 'El Salvador', 'Estonia', 'Fiji', 'Finland', 'France',
  'Georgia', 'Germany', 'Greece', 'Grenada', 'Guatemala', 'Guyana', 'Haiti', 'Honduras',
  'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos',
  'Latvia', 'Lebanon', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malaysia', 'Maldives',
  'Malta', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Myanmar', 'Nepal',
  'Netherlands', 'New Zealand', 'Nicaragua', 'North Korea', 'North Macedonia', 'Norway',
  'Oman', 'Pakistan', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Saint Kitts and Nevis',
  'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Saudi Arabia',
  'Serbia', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Spain', 'Sri Lanka',
  'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Thailand',
  'Timor-Leste', 'Trinidad and Tobago', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Venezuela', 'Vietnam', 'Yemen', 'Other',
]

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Complete beginner', desc: 'I know little to nothing about Web3' },
  { value: 'some_knowledge', label: 'Some knowledge', desc: "I understand the basics but haven't built anything" },
  { value: 'building', label: 'Already building', desc: "I've shipped something in Web3" },
]

const MOTIVATIONS = [
  { value: 'career_change', label: 'Switch my career into Web3' },
  { value: 'build_project', label: 'Build a specific project or idea' },
  { value: 'curiosity', label: 'General curiosity and learning' },
  { value: 'organisation', label: 'My organisation sent me' },
  { value: 'investment', label: 'Make better investment decisions' },
]

const INTERESTS = [
  { value: 'blockchain_basics', label: 'Blockchain Basics' },
  { value: 'smart_contracts', label: 'Smart Contracts' },
  { value: 'defi', label: 'DeFi' },
  { value: 'nfts', label: 'NFTs' },
  { value: 'daos', label: 'DAOs' },
  { value: 'web3_product', label: 'Web3 Product Building' },
  { value: 'tokenomics', label: 'Tokenomics' },
  { value: 'crypto_law', label: 'Crypto & Regulation' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StepCard({ children, stepKey }: { children: React.ReactNode; stepKey: string }) {
  return (
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  )
}

const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#F5C518]/40 transition-colors'
const selectClass = `${inputClass} appearance-none cursor-pointer`

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const auth = getStoredAuth()
  const firstName = auth?.user.name?.split(' ')[0] ?? 'there'

  const [step, setStep] = useState(1)

  // Step 1
  const [userRole, setUserRole] = useState('')
  const [gender, setGender] = useState('')
  const [country, setCountry] = useState('')

  // Step 2
  const [experienceLevel, setExperienceLevel] = useState('')
  const [motivation, setMotivation] = useState('')

  // Step 3
  const [learningInterests, setLearningInterests] = useState<string[]>([])
  const [telegramHandle, setTelegramHandle] = useState('')
  const [twitterHandle, setTwitterHandle] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const TOTAL_STEPS = 3

  function toggleInterest(val: string) {
    setLearningInterests(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    )
  }

  async function handleFinish() {
    setSubmitting(true)
    setError(null)
    try {
      await apiRequest('/auth/onboarding', {
        method: 'POST',
        body: JSON.stringify({
          userRole, gender, country, experienceLevel, motivation,
          learningInterests,
          telegramHandle: telegramHandle.replace(/^@/, ''),
          twitterHandle: twitterHandle.replace(/^@/, ''),
        }),
      })
      if (auth) {
        setStoredAuth({ ...auth, user: { ...auth.user, onboardingCompleted: true } })
      }
      window.location.href = '/dashboard'
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const canNext1 = userRole !== '' && gender !== ''
  const canNext2 = experienceLevel !== '' && motivation !== ''
  const canFinish = learningInterests.length > 0

  const progressPct = Math.round((step / TOTAL_STEPS) * 100)

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-16">

      {/* Logo */}
      <a href="/" className="flex items-center gap-2.5 mb-10">
        <div className="w-8 h-8 rounded-lg bg-[#F5C518] flex items-center justify-center">
          <span className="font-display font-extrabold text-[#0A0A0A] text-sm leading-none">R</span>
        </div>
        <span className="font-display font-bold text-base text-white">
          Rubikcon <span className="text-[#F5C518]">Nexus</span>
        </span>
      </a>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between text-xs text-white/30 mb-2">
          <span>Step {step} of {TOTAL_STEPS}</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#F5C518] rounded-full"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Cards */}
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">

          {/* ── Step 1: Role, Gender, Country ── */}
          {step === 1 && (
            <StepCard stepKey="step1">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-7">
                <p className="text-xs font-mono uppercase tracking-widest text-[#F5C518] mb-2">About you</p>
                <h1 className="font-display text-2xl font-extrabold text-white mb-1">Hey {firstName}, welcome!</h1>
                <p className="text-white/45 text-sm mb-6">Let's personalise your learning experience.</p>

                {/* Role */}
                <p className="text-sm font-medium text-white/70 mb-3">What best describes you?</p>
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  {USER_ROLES.map(r => (
                    <button
                      key={r.value}
                      onClick={() => setUserRole(r.value)}
                      className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm text-left transition-all ${
                        userRole === r.value
                          ? 'border-[#F5C518]/60 bg-[#F5C518]/10 text-white'
                          : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white/80'
                      }`}
                    >
                      <span>{r.icon}</span>
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>

                {/* Gender */}
                <p className="text-sm font-medium text-white/70 mb-2">Gender</p>
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  {GENDERS.map(g => (
                    <button
                      key={g.value}
                      onClick={() => setGender(g.value)}
                      className={`rounded-2xl border px-4 py-3 text-sm text-left transition-all ${
                        gender === g.value
                          ? 'border-[#F5C518]/60 bg-[#F5C518]/10 text-white'
                          : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white/80'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>

                {/* Country dropdown */}
                <p className="text-sm font-medium text-white/70 mb-2">Where are you based?</p>
                <div className="relative mb-6">
                  <select
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className={selectClass + ' [color-scheme:dark]'}
                  >
                    <option value="" disabled>Select your country...</option>
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-xs">▾</span>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!canNext1}
                  className="w-full rounded-full bg-[#F5C518] text-[#0A0A0A] font-semibold py-3 text-sm hover:bg-[#E8B800] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue →
                </button>
              </div>
            </StepCard>
          )}

          {/* ── Step 2: Experience + Motivation ── */}
          {step === 2 && (
            <StepCard stepKey="step2">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-7">
                <p className="text-xs font-mono uppercase tracking-widest text-[#F5C518] mb-2">Your background</p>
                <h1 className="font-display text-2xl font-extrabold text-white mb-1">Where are you starting from?</h1>
                <p className="text-white/45 text-sm mb-6">Helps us tailor course recommendations.</p>

                <p className="text-sm font-medium text-white/70 mb-3">Web3 experience level</p>
                <div className="flex flex-col gap-2 mb-5">
                  {EXPERIENCE_LEVELS.map(e => (
                    <button
                      key={e.value}
                      onClick={() => setExperienceLevel(e.value)}
                      className={`flex flex-col rounded-2xl border px-4 py-3 text-left transition-all ${
                        experienceLevel === e.value
                          ? 'border-[#F5C518]/60 bg-[#F5C518]/10'
                          : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                      }`}
                    >
                      <span className={`text-sm font-medium ${experienceLevel === e.value ? 'text-white' : 'text-white/70'}`}>{e.label}</span>
                      <span className="text-xs text-white/35 mt-0.5">{e.desc}</span>
                    </button>
                  ))}
                </div>

                <p className="text-sm font-medium text-white/70 mb-3">What brings you here?</p>
                <div className="flex flex-col gap-2 mb-6">
                  {MOTIVATIONS.map(m => (
                    <button
                      key={m.value}
                      onClick={() => setMotivation(m.value)}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm text-left transition-all ${
                        motivation === m.value
                          ? 'border-[#F5C518]/60 bg-[#F5C518]/10 text-white'
                          : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white/75'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full border-2 shrink-0 transition-colors ${motivation === m.value ? 'border-[#F5C518] bg-[#F5C518]' : 'border-white/25'}`} />
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 rounded-full border border-white/15 text-white/55 font-semibold py-3 text-sm hover:border-white/30 hover:text-white/80 transition-all">
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!canNext2}
                    className="flex-[2] rounded-full bg-[#F5C518] text-[#0A0A0A] font-semibold py-3 text-sm hover:bg-[#E8B800] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </StepCard>
          )}

          {/* ── Step 3: Interests + Socials ── */}
          {step === 3 && (
            <StepCard stepKey="step3">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-7">
                <p className="text-xs font-mono uppercase tracking-widest text-[#F5C518] mb-2">Goals & Socials</p>
                <h1 className="font-display text-2xl font-extrabold text-white mb-1">Almost there!</h1>
                <p className="text-white/45 text-sm mb-6">Pick topics you want to explore, and optionally connect your socials.</p>

                {/* Interests */}
                <p className="text-sm font-medium text-white/70 mb-3">What do you want to learn? <span className="text-white/30 font-normal">(pick all that apply)</span></p>
                <div className="grid grid-cols-2 gap-2.5 mb-6">
                  {INTERESTS.map(interest => {
                    const selected = learningInterests.includes(interest.value)
                    return (
                      <button
                        key={interest.value}
                        onClick={() => toggleInterest(interest.value)}
                        className={`rounded-2xl border px-4 py-3 text-sm text-left transition-all ${
                          selected
                            ? 'border-[#F5C518]/60 bg-[#F5C518]/10 text-white'
                            : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white/80'
                        }`}
                      >
                        <span className={`mr-2 text-xs ${selected ? 'text-[#F5C518]' : 'text-white/20'}`}>
                          {selected ? '✓' : '+'}
                        </span>
                        {interest.label}
                      </button>
                    )
                  })}
                </div>

                {/* Socials */}
                <p className="text-sm font-medium text-white/70 mb-3">Connect your socials <span className="text-white/30 font-normal">(optional)</span></p>
                <div className="flex flex-col gap-3 mb-6">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm select-none">✈</span>
                    <input
                      type="text"
                      value={telegramHandle}
                      onChange={e => setTelegramHandle(e.target.value)}
                      placeholder="Telegram handle (e.g. @yourname)"
                      className={inputClass + ' pl-9'}
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm select-none font-bold">𝕏</span>
                    <input
                      type="text"
                      value={twitterHandle}
                      onChange={e => setTwitterHandle(e.target.value)}
                      placeholder="X / Twitter handle (e.g. @yourname)"
                      className={inputClass + ' pl-9'}
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 mb-4">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 rounded-full border border-white/15 text-white/55 font-semibold py-3 text-sm hover:border-white/30 hover:text-white/80 transition-all">
                    ← Back
                  </button>
                  <button
                    onClick={handleFinish}
                    disabled={!canFinish || submitting}
                    className="flex-[2] rounded-full bg-[#F5C518] text-[#0A0A0A] font-semibold py-3 text-sm hover:bg-[#E8B800] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Saving...' : 'Go to dashboard →'}
                  </button>
                </div>

                <button
                  onClick={handleFinish}
                  disabled={submitting}
                  className="w-full mt-3 text-xs text-white/25 hover:text-white/45 transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </StepCard>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
