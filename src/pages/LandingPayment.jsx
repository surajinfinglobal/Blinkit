import { useNavigate } from 'react-router-dom'
import paymentimg from '../assets/blinkit_payment.png'

export default function LandingPayment({ onFinish, onBack }) {
  const navigate = useNavigate()

  const handleFinish = () => {
    onFinish?.()
    navigate('/Welcome')
  }

  return (
    <div
      className="flex w-full items-center justify-center overflow-hidden bg-[#F5F7FA]"
      style={{ minHeight: 'max(100vh, 884px)' }}
    >
      <main className="w-full max-w-[450px] h-[884px] bg-[#F5F7FA] sm:rounded-[48px] shadow-2xl relative flex flex-col justify-between overflow-hidden border border-slate-200/50 font-sans">
     
      {/* Illustration Section */}
      <section className="relative w-full flex-1 flex items-center justify-center overflow-hidden">
        {/* Container jiska background page ke background se match karta hai */}
        <div className="w-full h-full max-w-[400px] max-h-[400px] relative flex items-center justify-center overflow-hidden bg-[#F5F7FA]">
          <img
            alt="Easy & Safe Payment"
            /* object-cover aur mix-blend-multiply se image ka white background merge ho jayega */
            className="w-full h-full object-cover mix-blend-darken pointer-events-none select-none"
            src={paymentimg}
          />
        </div>
      </section>

      {/* Bottom content */}
      <article className="bg-white rounded-t-[40px] px-8 pt-8 pb-5 flex flex-col items-center text-center shadow-[0_-12px_40px_rgba(0,0,0,0.03)] z-20 select-none">
        <h1 className="text-[32px] font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
          Easy &amp; Safe Payment
        </h1>
        <p className="text-[15px] font-medium text-slate-400 mb-8 max-w-[270px] leading-relaxed">
          Experience seamless, secure checkout with multiple payment options
        </p>

        {/* Dots — 3rd active */}
        <nav
          aria-label="Slide Pagination"
          className="flex items-center justify-center space-x-2 mb-9"
        >
          <span className="w-2 h-2 bg-[#DCE4EC] rounded-full inline-block" />
          <span className="w-2 h-2 bg-[#DCE4EC] rounded-full inline-block" />
          <span
            aria-current="true"
            className="w-6 h-2 bg-[#F7D61D] rounded-full transition-all duration-300 inline-block"
          />
        </nav>

        {/* CTA */}
        <button
          type="button"
          onClick={handleFinish}
          className="w-full py-4 bg-[#F7D61D] hover:bg-[#F7D61D] active:scale-[0.99] transition duration-150 rounded-full text-black text-[17px] font-bold shadow-sm flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-yellow-600/20"
        >
          Get Started
        </button>

        {/* Home indicator */}
        <div className="w-full flex justify-center pt-6 pb-2">
          <div className="w-32 h-[4.5px] bg-slate-900 rounded-full opacity-80" />
        </div>
      </article>
      </main>
    </div>
  )
}