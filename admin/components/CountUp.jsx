import { useEffect, useRef } from "react";
import useCountUp from "../hooks/useCountUp";

const defaultFormat = (v) => (typeof v === 'number' ? v.toLocaleString("en-IN") : v);

export default function CountUp({ value, format = defaultFormat, className = "" }) {
  const numValue = typeof value === 'number' ? value : 0;
  const display = useCountUp(numValue);
  const ref = useRef(null);
  const mounted = useRef(false);

  // Value badalne par chhota pop (pehli baar nahi)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const el = ref.current;
    if (!el) return;
    el.classList.remove("metric-pop");
    void el.offsetWidth;
    el.classList.add("metric-pop");
  }, [numValue]);

  return (
    <span ref={ref} className={`counter-val ${className}`}>
      {format(display)}
    </span>
  );
}
