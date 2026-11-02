import { useEffect, useRef } from "react";
import useCountUp from "../hooks/useCountUp";

const defaultFormat = (v) => v.toLocaleString("en-IN");

export default function CountUp({ value, format = defaultFormat, className = "" }) {
  const display = useCountUp(value);
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
  }, [value]);

  return (
    <span ref={ref} className={`counter-val ${className}`}>
      {format(display)}
    </span>
  );
}
