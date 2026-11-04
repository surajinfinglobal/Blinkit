import { useNavigate } from 'react-router-dom'
import deliveryimg from '../assets/blinkit_delivery.png'

export default function LandingDelivery({ onNext, onBack }) {
  const navigate = useNavigate()

  const handleNext = () => {
    onNext?.()
    navigate('/payment')
  }

  return (
    <div
      className="flex w-full items-center justify-center overflow-hidden bg-[#F5F7FA]"
      style={{ minHeight: 'max(100vh, 884px)' }}
    >
      <main className="w-full max-w-[450px] h-[884px] bg-[#F5F7FA] sm:rounded-[48px] shadow-2xl relative flex flex-col justify-between overflow-hidden border border-slate-200/50 font-sans">
     
      {/* Illustration Section */}
      <section 
        className="relative w-full flex-1 flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: '#F5F7FA' }} // <--- Background pakka apply hoga
      >
        {/* Image container */}
        <div 
          className="w-[410px] h-[410px] max-w-[400px] max-h-[400px] relative flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#F5F7FA' }}
        >
          <img
            alt="Fast and fresh grocery delivery"
            className="w-full h-full object-contain mix-blend-multiply pointer-events-none select-none"
            src={deliveryimg}
          />
        </div>
      </section>

      {/* Bottom content */}
      <article className="bg-white rounded-t-[40px] px-8 pt-8 pb-5 flex flex-col items-center text-center shadow-[0_-12px_40px_rgba(0,0,0,0.03)] z-20 select-none">
        <h1 className="text-[32px] font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
          Fast &amp; Fresh Delivery
        </h1>
        <p className="text-[15px] font-medium text-slate-400 mb-8 max-w-[270px] leading-relaxed">
          Get fresh organic produce delivered right to your doorstep in minutes
        </p>

        {/* Dots — 2nd active */}
        <nav
          aria-label="Slide Pagination"
          className="flex items-center justify-center space-x-2 mb-9"
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
          className="w-full py-4 bg-[#F7D61D] hover:bg-[#F7D61D] active:scale-[0.99] transition duration-150 rounded-full text-black text-[17px] font-bold shadow-sm flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-yellow-600/20"
        >
          Next
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