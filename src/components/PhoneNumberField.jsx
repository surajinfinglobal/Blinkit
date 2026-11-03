export default function PhoneNumberField({ inputRef, phone, onPhoneChange, onFocus }) {
  return (
    <div className="fade-up w-full" style={{ animationDelay: '450ms' }}>
      <label className="sr-only" htmlFor="mobile-number">
        Enter Your Mobile Number
      </label>
      <div className="group field-glow flex w-full items-center gap-3 rounded-2xl border-1 border-neutral-200 bg-white px-4 py-3.5 shadow-sm transition-all duration-200 hover:border-neutral-300 focus-within:scale-[1.02] focus-within:border-[#F8CB46] focus-within:ring-4 focus-within:ring-[#F8CB46]/25">
        <svg
          className="phone-ring h-5 w-5 shrink-0 fill-none stroke-neutral-400 transition-colors duration-200 group-focus-within:stroke-[#B8860B]"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
          <path d="M11 18.5h2" />
        </svg>
        <span className="border-r border-neutral-200 pr-3 text-[15px] font-semibold text-neutral-800">+91</span>
        <input
          ref={inputRef}
          id="mobile-number"
          type="tel"
          inputMode="none"
          placeholder="Enter Your Mobile Number"
          className="w-full border-0 bg-transparent p-0 text-[15px] text-neutral-800 outline-none placeholder:text-neutral-400 focus:ring-0"
          value={phone}
          onChange={(event) => {
            const value = event.target.value.replace(/\D/g, '').slice(0, 10);
            onPhoneChange(value);
          }}
          onFocus={onFocus}
        />
        <svg
          className="arrow-nudge h-5 w-5 shrink-0 fill-none stroke-neutral-300 transition-colors group-focus-within:stroke-[#B8860B]"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </div>
    </div>
  );
}
