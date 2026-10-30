import React, { useState, useEffect } from 'react';

/* ================= COLOURFUL SVG ICONS ================= */
const GroceriesIcon = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M18 30 Q32 4 46 30" fill="none" stroke="#A9652E" strokeWidth="4" strokeLinecap="round" />
    <circle cx="23" cy="26" r="9" fill="#5CB85C" />
    <path d="M23 18 Q23 26 23 34 M23 26 Q18 22 16 20 M23 26 Q28 22 30 20" stroke="#3E8E41" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <circle cx="39" cy="25" r="9" fill="#E53935" />
    <path d="M39 16 Q40 12 44 12" stroke="#6D4C41" strokeWidth="2" fill="none" strokeLinecap="round" />
    <ellipse cx="36" cy="22" rx="2" ry="3" fill="#fff" opacity="0.35" />
    <g transform="rotate(-18 32 28)">
      <rect x="28" y="10" width="7" height="20" rx="3.5" fill="#E8A23B" />
    </g>
    <path d="M8 30 H56 L50 54 Q49.5 56 47 56 H17 Q14.5 56 14 54 Z" fill="#F2B84B" />
    <path d="M13 38 H51 M15 46 H49 M22 30 L24 56 M32 30 V56 M42 30 L40 56" stroke="#C98A1B" strokeWidth="1.6" fill="none" />
  </svg>
);

const ElectronicsIcon = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="8" y="12" width="40" height="28" rx="3" fill="#2F3A4F" />
    <rect x="11" y="15" width="34" height="22" rx="1.5" fill="#4FC3F7" />
    <circle cx="22" cy="26" r="5" fill="#FFD54F" />
    <path d="M11 37 L24 26 L33 33 L39 28 L45 33 V37 Z" fill="#43A047" />
    <path d="M4 42 H52 L48 49 Q47.5 50 46.5 50 H9.5 Q8.5 50 8 49 Z" fill="#B0B8C4" />
    <rect x="22" y="42" width="12" height="2" rx="1" fill="#8A93A0" />
    <rect x="41" y="26" width="17" height="30" rx="3.5" fill="#1F2937" />
    <rect x="43.5" y="29" width="12" height="22" rx="1.5" fill="#FF8A65" />
    <circle cx="49.5" cy="38" r="3.5" fill="#FFE082" />
    <rect x="47" y="53" width="5" height="1.5" rx="0.75" fill="#6B7280" />
  </svg>
);

const FoodIcon = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M9 29 C9 12 55 12 55 29 Z" fill="#F4A63A" />
    <ellipse cx="22" cy="20" rx="2.2" ry="1.2" fill="#FFF3D6" />
    <ellipse cx="32" cy="16.5" rx="2.2" ry="1.2" fill="#FFF3D6" />
    <ellipse cx="42" cy="20" rx="2.2" ry="1.2" fill="#FFF3D6" />
    <ellipse cx="29" cy="24" rx="2.2" ry="1.2" fill="#FFF3D6" />
    <ellipse cx="38" cy="25" rx="2.2" ry="1.2" fill="#FFF3D6" />
    <path d="M7 31 q4.5 6 9 0 q4.5 6 9 0 q4.5 6 9 0 q4.5 6 9 0 q4.5 6 9 0 q2 3 2 0 V33 H7 Z" fill="#6BBF59" />
    <path d="M12 34 H52 L50 37 H14 Z" fill="#FFD54F" />
    <rect x="10" y="37" width="44" height="5" rx="2.5" fill="#E8453C" />
    <rect x="8" y="42" width="48" height="8" rx="4" fill="#7B4A2D" />
    <path d="M10 51 H54 V53 a6 6 0 0 1 -6 6 H16 a6 6 0 0 1 -6 -6 Z" fill="#F4A63A" />
  </svg>
);

const VegetablesIcon = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <g transform="rotate(-22 20 38)">
      <path d="M20 60 L12 26 Q20 19 28 26 Z" fill="#FF8A1F" />
      <path d="M15 34 H21 M18 43 H24 M17 50 H21" stroke="#D96A00" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="14.5" cy="17" rx="3" ry="8" fill="#43A047" transform="rotate(-18 14.5 17)" />
      <ellipse cx="20" cy="14" rx="3" ry="9" fill="#66BB6A" />
      <ellipse cx="25.5" cy="17" rx="3" ry="8" fill="#43A047" transform="rotate(18 25.5 17)" />
    </g>
    <circle cx="42" cy="41" r="16" fill="#E8453C" />
    <ellipse cx="36" cy="35" rx="3.5" ry="5" fill="#fff" opacity="0.3" transform="rotate(30 36 35)" />
    <path d="M42 25 L38 30 L42 28.5 L46 30 Z M42 25 L34 27 L40 29 Z M42 25 L50 27 L44 29 Z" fill="#43A047" />
    <rect x="41" y="20" width="2" height="6" rx="1" fill="#2E7D32" />
  </svg>
);

const FruitsIcon = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 20 C22 13 9 22 11 37 C13 51 24 59 32 55 C40 59 51 51 53 37 C55 22 42 13 32 20 Z" fill="#E53935" />
    <path d="M32 20 C36 15 44 14 48 18 C44 26 36 26 32 20 Z" fill="#7CB342" />
    <path d="M32 20 Q32 12 36 8" stroke="#6D4C41" strokeWidth="3" fill="none" strokeLinecap="round" />
    <ellipse cx="22" cy="33" rx="3.5" ry="7" fill="#fff" opacity="0.3" transform="rotate(20 22 33)" />
  </svg>
);

const DairyIcon = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <polygon points="16,24 32,8 48,24" fill="#90CAF9" />
    <polygon points="16,24 32,8 32,24" fill="#BBDEFB" />
    <rect x="16" y="24" width="32" height="34" rx="2" fill="#FFFFFF" stroke="#5B9BD5" strokeWidth="2" />
    <rect x="16" y="33" width="32" height="14" fill="#4FA3F7" />
    <path d="M32 35 C28 40 28 44 32 45 C36 44 36 40 32 35 Z" fill="#fff" />
    <rect x="21" y="50" width="22" height="3" rx="1.5" fill="#BBDEFB" />
  </svg>
);

/* ================= CATEGORIES ================= */
const categoriesData = [
  { id: 'groceries', Icon: GroceriesIcon, color: '#F8CB46', label: 'Groceries' },
  { id: 'electronics', Icon: ElectronicsIcon, color: '#4FC3F7', label: 'Electronics' },
  { id: 'food', Icon: FoodIcon, color: '#ffb95f', label: 'Food' },
  { id: 'vegetables', Icon: VegetablesIcon, color: '#83e596', label: 'Vegetables' },
  { id: 'fruits', Icon: FruitsIcon, color: '#ff8a80', label: 'Fruits' },
  { id: 'dairy', Icon: DairyIcon, color: '#90caf9', label: 'Dairy' },
];

export default function CategoryPulseSplash() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % categoriesData.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const current = categoriesData[currentIndex];
  const { Icon } = current;

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f9f9f7]">
      {/* Wrapper */}
      <div className="relative flex flex-col items-center justify-center w-56 h-56">
        
        {/* ================= PULSE RINGS ================= */}
        {[0, 0.66, 1.33].map((delay) => (
          <div
            key={delay}
            className="absolute rounded-full animate-ripple border-2"
            style={{
              width: '96px',
              height: '96px',
              borderColor: current.color,
              animationDelay: `${delay}s`,
            }}
          ></div>
        ))}

        {/* ================= CENTER ICON ================= */}
        {/* Icon ka div h-20 w-20 kiya taaki icon achhe se dikhe */}
        <div
          className="relative z-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-500"
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: `${current.color}33`,
            border: `2px solid ${current.color}`,
          }}
        >
          <div key={current.id} className="animate-fade-subtle w-12 h-12">
            <Icon />
          </div>
        </div>

        {/* ================= LABEL ================= */}
        {/* Label ko -bottom-12 par rakha taaki ring ke saath overlap na ho aur text clear dikhe */}
        <div className="absolute -bottom-12 flex flex-col items-center">
          <p className="text-[13px] font-bold text-[#1a1c1b] tracking-widest flex" aria-label="Loading">
            {'Loading...'.split('').map((char, i) => (
              <span
                key={i}
                className="loading-letter"
                style={{ animationDelay: `${i * 0.1}s` }}
                aria-hidden="true"
              >
                {char}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes ripple {
          0%   { transform: scale(1);   opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .animate-ripple {
          animation: ripple 2s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
        }

        @keyframes fadeSubtle {
          from { opacity: 0.6; transform: scale(0.95); }
          to   { opacity: 1;   transform: scale(1); }
        }
        .animate-fade-subtle {
          animation: fadeSubtle 0.4s ease-out;
        }

        /* Loading text: har letter ek ke baad ek bounce (wave) */
        @keyframes letterBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%           { transform: translateY(-6px); }
        }
        .loading-letter {
          display: inline-block;
          animation: letterBounce 1.2s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .loading-letter { animation: none; }
        }   
      `}</style>
    </div>
  );
}