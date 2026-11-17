import { useNavigate } from 'react-router-dom'
import paymentimg from '../assets/blinkit_payment.png'

export default function LandingPayment({ onFinish, onBack }) {
  const navigate = useNavigate()

  const handleFinish = () => {
    onFinish?.()
    navigate('/Welcome')
  }

  return (
    <div className="flex h-[100dvh] min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#F5F7FA]">
      <main className="relative flex h-full min-h-0 w-full max-w-[450px] flex-col justify-between overflow-hidden border border-slate-200/50 bg-[#F5F7FA] font-sans sm:rounded-[48px] sm:shadow-2xl">
        <section className="relative flex w-full min-h-0 flex-1 items-center justify-center overflow-hidden">
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#F5F7FA]">
          <img
            alt="Easy & Safe Payment"
            className="h-full w-full object-contain mix-blend-multiply pointer-events-none select-none"
            src={paymentimg}
          />
        </div>
      </section>

      {/* Bottom content */}
      <article className="onboarding-content z-20 flex h-[300px] shrink-0 flex-col items-center rounded-t-[40px] bg-white px-6 pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] text-center shadow-[0_-12px_40px_rgba(0,0,0,0.03)] select-none sm:h-[340px] sm:px-8 sm:pt-8 sm:pb-5">
        <h1 className="mb-1 flex h-14 w-full items-center justify-center text-[24px] font-extrabold leading-tight tracking-tight text-slate-900 sm:mb-2 sm:h-[4.5rem] sm:text-[32px]">
          Easy &amp; Safe Payment
        </h1>
        <p className="mb-2 flex h-[3.75rem] max-w-[300px] items-center justify-center text-[14px] font-medium leading-relaxed text-slate-400 sm:mb-5 sm:h-16 sm:text-[15px]">
          Experience seamless, secure checkout with multiple payment options
        </p>

        <nav
          aria-label="Slide Pagination"
          className="mb-4 flex h-2 items-center justify-center space-x-2 sm:mb-5"
        >
          <span className="w-2 h-2 bg-[#DCE4EC] rounded-full inline-block" />
          <span className="w-2 h-2 bg-[#DCE4EC] rounded-full inline-block" />
          <span
            aria-current="true"
            className="w-6 h-2 bg-[#F7D61D] rounded-full transition-all duration-300 inline-block"
          />
        </nav>

        <button
          type="button"
          onClick={handleFinish}
          className="flex min-h-12 w-full items-center justify-center rounded-full bg-[#F7D61D] py-3 text-[17px] font-bold text-black shadow-sm transition duration-150 hover:bg-[#F7D61D] active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-yellow-600/20 sm:min-h-14"
        >
          Get Started
        </button>

        <div className="flex w-full justify-center pt-3 pb-0 sm:pt-4">
          <div className="w-32 h-[4.5px] bg-slate-900 rounded-full opacity-80" />
        </div>
      </article>
      </main>
    </div>
  )
}