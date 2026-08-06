import AcademyNavbar from '../components/AcademyNavbar'

export default function FacilitatorPortalPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AcademyNavbar solid />
      <main className="pt-28 pb-16 px-6 max-w-7xl mx-auto">
        <h1 className="font-display text-4xl font-extrabold text-white mb-8">Facilitator Portal</h1>
        
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
          <p className="text-white/60 mb-6 text-lg">
            Welcome to the Facilitator Portal! This area is under construction.
          </p>
          <p className="text-white/40">
            Soon, you will be able to manage your courses, view learner progress, and grade assignments from here.
          </p>
        </div>
      </main>
    </div>
  )
}
