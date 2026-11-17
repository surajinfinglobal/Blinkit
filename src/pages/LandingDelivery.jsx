import { useNavigate } from 'react-router-dom'
import deliveryimg from '../assets/blinkit_delivery.png'

export default function LandingDelivery({ onNext, onBack }) {
  const navigate = useNavigate()

  const handleNext = () => {
    onNext?.()
    navigate('/payment')
  }

  return (
    <div className="flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#F5F7FA]">
      <main className="relative flex h-full w-full max-w-[450px] flex-col justify-between overflow-hidden border border-slate-200/50 bg-[#F5F7FA] font-sans sm:rounded-[48px] sm:shadow-2xl">

      {/* Illustration Section */}
      <section
        className="relative flex w-full flex-1 min-h-0 items-center justify-center overflow-hidden"
        style={{ backgroundColor: '#F5F7FA' }}
      >
        {/* Image container */}
        <div
          className="relative flex h-full w-full items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#F5F7FA' }}
        >
          <img
            alt="Fast and fresh grocery delivery"
            className="h-full w-full object-contain mix-blend-multiply pointer-events-none select-none"
            src={deliveryimg}
          />
        </div>
      </section>

      {/* Bottom content */}
      <article className="onboarding-content z-20 flex h-[300px] shrink-0 flex-col items-center rounded-t-[40px] bg-white px-6 pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] text-center shadow-[0_-12px_40px_rgba(0,0,0,0.03)] select-none sm:h-[340px] sm:px-8 sm:pt-8 sm:pb-5">
        <h1 className="mb-1 flex h-14 w-full items-center justify-center text-[24px] font-extrabold leading-tight tracking-tight text-slate-900 sm:mb-2 sm:h-[4.5rem] sm:text-[32px]">
          Fast &amp; Fresh Delivery
        </h1>
        <p className="mb-2 flex h-[3.75rem] max-w-[300px] items-center justify-center text-[14px] font-medium leading-relaxed text-slate-400 sm:mb-5 sm:h-16 sm:text-[15px]">
          Get fresh organic produce delivered right to your doorstep in minutes
        </p>

        {/* Dots — 2nd active */}
        <nav
          aria-label="Slide Pagination"
          className="mb-4 flex h-2 items-center justify-center space-x-2 sm:mb-5"
        >
          <span className="w-2 h-2 bg-[#DCE4EC] rounded-full inline-block" />
          <span
            aria-current="true"
            className="w-6 h-2 bg-[#F7D61D] rounded-full transition-all duration-300 inline-block"
          />
          <span className="w-2 h-2 bg-[#DCE4EC] rounded-full inline-block" />
        </nav>

        {/* CTA */}
        <button
          type="button"
          onClick={handleNext}
          className="flex min-h-12 w-full items-center justify-center rounded-full bg-[#F7D61D] py-3 text-[17px] font-bold text-black shadow-sm transition duration-150 hover:bg-[#F7D61D] active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-yellow-600/20 sm:min-h-14"
        >
          Next
        </button>

        {/* Home indicator */}
        <div className="flex w-full justify-center pt-3 pb-0 sm:pt-4">
          <div className="w-32 h-[4.5px] bg-slate-900 rounded-full opacity-80" />
        </div>
      </article>
      </main>
    </div>
  )
}