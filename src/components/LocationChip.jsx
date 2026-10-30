import React from 'react';

export default function LocationChip({
  onClick,
  selectedAddress,
  showSheet = false,
  ariaLabel = 'Select delivery location',
  shine = false,
  className = '',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${shine ? 'chip-shine ' : ''}relative overflow-hidden flex items-center gap-2 bg-black/10 hover:bg-black/15 rounded-full pl-2.5 pr-3 py-1.5 text-left transition active:scale-[0.98] ${className}`}
    >
      <span className="material-symbols-outlined pin-drop text-[20px] text-black shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
        location_on
      </span>
      <span className="flex-1 min-w-0 text-[12px] font-semibold text-black/85 truncate">
        {selectedAddress
          ? `${selectedAddress.label}${selectedAddress.line ? ` · ${selectedAddress.line}` : ''}${selectedAddress.pincode ? ` - ${selectedAddress.pincode}` : ''}`
          : 'Select your location'}
      </span>
      <span className={`material-symbols-outlined text-[18px] text-black/80 shrink-0 transition-transform duration-300 ${showSheet ? 'rotate-180' : ''}`}>
        expand_more
      </span>
    </button>
  );
}
