import { useEffect, useRef, useState } from "react";

/* Number ko smoothly count karta hai. Pehli baar 0 se, baad mein current se naye value tak. */
export default function useCountUp(value) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const firstRef = useRef(true);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      fromRef.current = value;
      setDisplay(value);
      return;
    }
    const duration = firstRef.current ? 1400 : 350;
    firstRef.current = false;
    const from = fromRef.current;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t); // easeOutExpo
      const v = Math.round(from + (value - from) * eased);
      fromRef.current = v;
      setDisplay(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return display;
}
