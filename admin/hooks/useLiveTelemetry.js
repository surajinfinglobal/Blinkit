import { useCallback, useEffect, useState } from "react";

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

/* Simulated live telemetry (real app mein yahan API polling / websocket lagao) */
export default function useLiveTelemetry(intervalMs = 4200) {
  const [t, setT] = useState({
    orders: 1482,
    ordersTick: 0,
    fleetTransit: 42,
    hubCap: 94,
    speed: 28,
    lastSync: new Date(),
  });

  const tick = useCallback(() => {
    setT((p) => {
      const next = { ...p, lastSync: new Date(), speed: 26 + Math.floor(Math.random() * 8) };
      if (Math.random() > 0.35) {
        next.orders = p.orders + (Math.random() > 0.7 ? 2 : 1);
        next.ordersTick = p.ordersTick + 1;
      }
      if (Math.random() > 0.5) next.fleetTransit = clamp(p.fleetTransit + (Math.random() > 0.5 ? 1 : -1), 38, 48);
      if (Math.random() > 0.7) next.hubCap = 92 + Math.floor(Math.random() * 4);
      return next;
    });
  }, []);

  useEffect(() => {
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id); // original me interval kabhi clear nahi hota tha
  }, [tick, intervalMs]);

  return { ...t, refresh: tick };
}
