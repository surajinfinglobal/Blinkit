"use client";

import { CheckCircleIcon, CircleNotchIcon, LightningIcon, PrinterIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Invoice from '../assets/Blinkit _Download _Invoice.png';
import jsPDF from 'jspdf';

const easeOut = [0.23, 1, 0.32, 1];
const easeInOut = [0.77, 0, 0.175, 1];

const defaultItems = [
  { name: "Amul Taaza Milk", unit: "500 ml", qty: 2, price: 29 },
  { name: "Fresh Tomato (Local)", unit: "500 g", qty: 1, price: 32 },
  { name: "Lay's Magic Masala", unit: "52 g", qty: 3, price: 20 },
  { name: "Britannia Brown Bread", unit: "400 g", qty: 1, price: 50 },
  { name: "Robusta Banana", unit: "6 pcs", qty: 1, price: 45 },
];

const statusLabels = {
  processing: "Prepare Your Invoice",
  printing: "Printing your Invoice",
  complete: "Delivered in {mins} minutes",
};

// ---------- Receipt tear-off edge ----------
const toothCount = 40;
const toothDepth = 4;
const toothPoints = Array.from({ length: toothCount * 2 }, (_, i) => {
  const x = 100 - ((i + 1) * 100) / (toothCount * 2);
  const y = i % 2 === 0 ? "100%" : `calc(100% - ${toothDepth}px)`;
  return `${x}% ${y}`;
}).join(", ");
const receiptClipPath = `polygon(0 0, 100% 0, 100% calc(100% - ${toothDepth}px), ${toothPoints})`;

// ---------- Stepped paper feed (like a thermal head advancing) ----------
const feedTransforms = [
  "translateY(-100%)",
  "translateY(-91%)", "translateY(-91%)",
  "translateY(-81%)", "translateY(-81%)",
  "translateY(-70%)", "translateY(-70%)",
  "translateY(-58%)", "translateY(-58%)",
  "translateY(-45%)", "translateY(-45%)",
  "translateY(-32%)", "translateY(-32%)",
  "translateY(-20%)", "translateY(-20%)",
  "translateY(-10%)", "translateY(-10%)",
  "translateY(-3%)", "translateY(-3%)",
  "translateY(0%)",
];
const feedTimes = [
  0, 0.075, 0.105, 0.18, 0.21, 0.285, 0.315, 0.39, 0.42, 0.495, 0.525, 0.6,
  0.63, 0.705, 0.735, 0.81, 0.84, 0.915, 0.945, 1,
];

const rupee = (n) => `₹${n}`;

function cn(...c) {
  return c.filter(Boolean).join(" ");
}

// ---------- Wordmark ----------
function Wordmark({ className }) {
  return (
    <span className={cn("font-black lowercase leading-none tracking-tight text-[#1F1F1F]", className)}>
      blink<span className="text-[#0C831F]">it</span>
    </span>
  );
}

// ---------- Status indicator ----------
function StatusIcon({ stage, animate, move }) {
  const done = stage === "complete";
  const common = {
    animate: { opacity: 1, transform: "scale(1)" },
    initial: { opacity: animate ? 0 : 1, transform: move ? "scale(0.94)" : "scale(1)" },
    exit: { opacity: animate ? 0 : 1, transform: move ? "scale(0.96)" : "scale(1)" },
    transition: { duration: animate ? 0.16 : 0, ease: easeOut },
    className: "col-start-1 row-start-1 grid place-items-center text-[#0C831F]",
  };
  return (
    <span aria-hidden="true" className="relative grid size-5 shrink-0 place-items-center">
      <AnimatePresence initial={false} mode="sync">
        {done ? (
          <motion.span key="done" {...common}>
            <CheckCircleIcon size={18} weight="fill" />
          </motion.span>
        ) : (
          <motion.span key="work" {...common}>
            <CircleNotchIcon
              size={18}
              weight="bold"
              className={cn(animate && "animate-spin motion-reduce:animate-none")}
            />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function Status({ stage, animate, move, mins }) {
  const label = statusLabels[stage].replace("{mins}", mins);
  return (
    <div className="flex min-w-0 items-center gap-2">
      <StatusIcon stage={stage} animate={animate} move={move} />
      <div aria-live="polite" role="status" className="grid min-w-0 flex-1 items-center">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={stage}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            initial={{ opacity: animate ? 0 : 1, transform: move ? "translateY(4px)" : "translateY(0px)" }}
            exit={{ opacity: animate ? 0 : 1, transform: move ? "translateY(-4px)" : "translateY(0px)" }}
            transition={{ duration: animate ? 0.18 : 0, ease: easeOut }}
            className="col-start-1 row-start-1 truncate text-xs font-semibold leading-none text-[#0C831F]"
          >
            {label}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Dashed() {
  return <div className="my-3 border-t border-dashed border-[#1F1F1F]/30" />;
}

function BillRow({ label, value, strike, free }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[#666]">{label}</span>
      <span className="flex items-baseline gap-1.5">
        {strike && <span className="text-[#666] line-through">{strike}</span>}
        <span className={free ? "font-bold text-[#0C831F]" : undefined}>{value}</span>
      </span>
    </div>
  );
}

// ---------- Component ----------
const BlinkitPrinter = forwardRef(function BlinkitPrinter(
  {
    stage: controlledStage,
    autoPlay = false,
    showPrintButton = true,
    animate = true,
    items = defaultItems,
    orderId = "ORD-2048",
    date = "11 AUG 2026 · 14:32",
    deliveredTo = "Home",
    paidWith = "UPI •••• 4242",
    deliveryMinutes = 9,
    deliveryFee = 0,
    deliveryFeeStrike = 25,
    handlingFee = 4,
    savings = 50,
    className,
    onComplete,
  },
  ref,
) {
  const reduceMotion = useReducedMotion();
  const move = animate && !reduceMotion;
  const location = useLocation();
  const routeOrder = location.state?.order || null;

  const effItems = routeOrder?.items
    ? routeOrder.items.map((it) => ({ name: it.name, unit: it.unit, qty: it.qty, price: it.price }))
    : items;
  const effOrderId = routeOrder ? `ORD-${routeOrder.id}` : orderId;
  const effDate = routeOrder?.placedAt
    ? new Date(routeOrder.placedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' +
      new Date(routeOrder.placedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : date;
  const effDeliveredTo = routeOrder?.address ? routeOrder.address : deliveredTo;
  const effPaidWith = routeOrder?.payment || paidWith;
  const effDeliveryFee = routeOrder?.deliveryFee ?? deliveryFee;
  const effHandlingFee = routeOrder?.handlingFee ?? handlingFee;
  const effSavings = routeOrder?.discount ?? savings;

  const [internalStage, setInternalStage] = useState("processing");
  const stage = controlledStage ?? internalStage;
  const isControlled = controlledStage !== undefined;

  const timers = useRef([]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const downloadPDF = () => {
    const pdf = new jsPDF('p', 'mm', [80, 200]);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 4;
    let y = 5;

    pdf.setFontSize(11);
    pdf.setFont(undefined, 'bold');
    pdf.text('blinkit', margin, y);
    pdf.setFontSize(7);
    pdf.setFont(undefined, 'normal');
    pdf.text('Invoice', pageWidth - margin, y, { align: 'right' });
    y += 7;

    pdf.setFontSize(6.5);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Order: ${effOrderId}`, margin, y);
    pdf.text(`Date: ${effDate}`, margin, y + 3.5);
    pdf.text(`Delivered to: ${effDeliveredTo}`, margin, y + 7);
    pdf.text(`Paid via: ${effPaidWith}`, margin, y + 10.5);
    y += 15;

    pdf.setDrawColor(0, 0, 0);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 3;

    pdf.setFontSize(6.5);
    pdf.setFont(undefined, 'bold');
    pdf.text('Item', margin, y);
    pdf.text('Qty', pageWidth - margin - 20, y, { align: 'right' });
    pdf.text('Amount', pageWidth - margin, y, { align: 'right' });
    y += 4;
    pdf.line(margin, y, pageWidth - margin, y);
    y += 3;

    pdf.setFont(undefined, 'normal');
    for (const item of effItems) {
      pdf.text(item.name, margin, y, { maxWidth: pageWidth - margin - 35 });
      pdf.text(`${item.qty}\u00d7`, pageWidth - margin - 25, y, { align: 'right' });
      pdf.text(rupee(item.qty * item.price), pageWidth - margin, y, { align: 'right' });
      y += 4.5;
    }

    pdf.line(margin, y, pageWidth - margin, y);
    y += 4;

    pdf.setFontSize(6.5);
    pdf.setFont(undefined, 'normal');
    pdf.text('Item total', margin, y);
    pdf.text(rupee(itemTotal), pageWidth - margin, y, { align: 'right' });
    y += 3.5;
    pdf.text('Delivery charge', margin, y);
    pdf.text(effDeliveryFee === 0 ? 'FREE' : rupee(effDeliveryFee), pageWidth - margin, y, { align: 'right' });
    y += 3.5;
    pdf.text('Handling charge', margin, y);
    pdf.text(rupee(effHandlingFee), pageWidth - margin, y, { align: 'right' });
    y += 5;

    pdf.setFillColor(247, 214, 29);
    pdf.rect(margin, y, pageWidth - 2 * margin, 7, 'F');
    pdf.setFontSize(7);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Grand total', margin + 2, y + 3);
    pdf.text(rupee(grandTotal), pageWidth - margin - 2, y + 3, { align: 'right' });
    y += 11;

    if (effSavings > 0) {
      pdf.setFillColor(232, 245, 234);
      pdf.rect(margin, y, pageWidth - 2 * margin, 6, 'F');
      pdf.setFontSize(6.5);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(12, 131, 31);
      pdf.text(`You saved ${rupee(effSavings)} on this order`, margin + 2, y + 3.5);
      y += 9;
    }

    pdf.save(`invoice-${effOrderId.replace('ORD-', '')}.pdf`);
  };

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const replay = useCallback(() => {
    clear();
    setInternalStage("processing");
    timers.current.push(setTimeout(() => setInternalStage("printing"), 800));
    timers.current.push(
      setTimeout(() => {
        setInternalStage("complete");
        onCompleteRef.current?.();
      }, 3000),
    );
  }, []);

  useImperativeHandle(ref, () => ({ replay }), [replay]);

  useEffect(() => {
    if (autoPlay && !isControlled) replay();
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const itemTotal = effItems.reduce((s, i) => s + i.qty * i.price, 0);
  const itemCount = effItems.reduce((s, i) => s + i.qty, 0);
  const grandTotal = itemTotal + effDeliveryFee + effHandlingFee;

  const showPaper = stage !== "processing";
  const isPrinting = stage === "printing";

  return (
    <section
      aria-label="Blinkit Invoice printer"
      data-stage={stage}
      className={cn("relative isolate flex w-full max-w-sm flex-col items-center mx-auto mt-12", className)}
    >
      {/* ============ PRINTER BODY ============ */}
      <div className="relative z-30 w-full">
        <div
          className="relative isolate w-full rounded-3xl border border-[#E6BF00] bg-[#F7D61D] p-3 pb-9 shadow-[0_18px_30px_-16px_rgba(12,131,31,0.55),0_4px_10px_-6px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-2px_0_rgba(0,0,0,0.12)]"
        >
          {/* top vents */}
          

          {/* header */}
          <div className="relative z-10 mt-1 flex h-11 items-start justify-between">
            <Wordmark className="mt-1 ml-1 text-2xl" />
            {showPrintButton && (
              <button
                type="button"
                onClick={() => {
                  if (!isControlled) {
                    replay();
                    setTimeout(downloadPDF, 3500);
                  }
                }}
                disabled={isControlled}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#0C831F] px-3 text-xs font-semibold text-white shadow-[0_2px_0_#064012] transition hover:bg-[#0a6e1a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F1F1F] active:translate-y-0.5 active:shadow-none disabled:opacity-60"
              >
                <PrinterIcon size={13} weight="fill" />
               Download Invoice
              </button>
            )}
          </div>

          {/* screen */}
          <div className="relative z-10 isolate overflow-hidden max-h-[26rem] rounded-[0.75rem] border border-[#E6BF00] bg-white p-4 text-[#1F1F1F] shadow-inner after:pointer-events-none after:absolute after:inset-0 after:z-20 after:rounded-[inherit] after:shadow-[inset_0_0_24px_4px_rgba(247,214,29,0.45)] after:content-['']">
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">Your order</p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-[#666]">
                    <LightningIcon size={12} weight="fill" className="text-[#0C831F]" />
                    {itemCount} items · 10 min delivery
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-[#666]">To pay</p>
                  <p className="mt-0.5 text-base font-extrabold leading-none text-[#0C831F]">{rupee(grandTotal)}</p>
                </div>
              </div>
              <Status stage={stage} animate={animate} move={move} mins={deliveryMinutes} />
            </div>
          </div>

          {/* status LED */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute right-7 bottom-3 size-1.5 rounded-full transition-colors duration-200",
              isPrinting
                ? "bg-[#0C831F] shadow-[0_0_6px_2px_rgba(12,131,31,0.7)] motion-safe:animate-pulse"
                : stage === "complete"
                  ? "bg-[#0C831F]/80"
                  : "bg-black/25",
            )}
          />
        </div>

        {/* paper slot mouth — straddles the bottom edge so paper exits through it */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 -bottom-[-8px] z-40 h-3 w-[calc(80%+20px)] -translate-x-1/2 rounded-[4px] border border-[#064012] bg-[#0A5F17] shadow-[inset_0_3px_4px_rgba(0,0,0,0.6),0_2px_3px_rgba(0,0,0,0.2)]"
        />
      </div>

      {/* ============ PAPER (hangs down through the slot mouth) ============ */}
      <div className="relative z-80 mt-[-15px] w-[calc(80%+16px)] overflow-hidden px-2 pb-3">
        <img
    className="absolute inset-0 z-0 h-full w-full object-contain  mix-blend-multiply"
    src={Invoice}
    alt="Invoice"
  />
        <motion.div
          initial={false}
          aria-hidden={stage !== "complete"}
          animate={{
            opacity: showPaper ? 1 : 0,
            transform: isPrinting && move ? feedTransforms : showPaper || !move ? "translateY(0%)" : "translateY(-100%)",
          }}
          transition={{
            opacity: { duration: animate ? 0.16 : 0, ease: easeOut },
            transform: {
              duration: move ? 1.75 : 0,
              ease: isPrinting && move ? "linear" : easeInOut,
              times: isPrinting && move ? feedTimes : undefined,
            },
          }}
          style={{ filter: "drop-shadow(0 4px 5px rgba(0,0,0,0.18))" }}
           className="relative z-10"
        >
          
          <article
            className="relative bg-white px-6 pb-8 font-mono text-[#1F1F1F]"
            style={{ clipPath: receiptClipPath }}
          >
            {/* shadow cast by the slot lip onto the paper */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-4 bg-gradient-to-b from-black/25 to-transparent"
            />

            {/* brand band */}
            <div className="-mx-6 mb-4 flex items-center justify-between bg-[#F7D61D] px-6 pt-5 pb-3">
              <Wordmark className="text-xl" />
              {/* <span className="inline-flex items-center gap-1 rounded-full bg-[#0C831F] px-2 py-1 text-[8px] font-bold leading-none text-white">
                <LightningIcon size={9} weight="fill" />
                {deliveryMinutes} min
              </span> */}
            </div>

            {/* meta */}
            <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-[9px] leading-3">
              <span className="text-[#666]">Order ID</span>
              <span>{effOrderId}</span>
              <span className="text-[#666]">Date</span>
              <span>{effDate}</span>
              <span className="text-[#666]">Delivered to</span>
              <span>{effDeliveredTo}</span>
              <span className="text-[#666]">Paid via</span>
              <span>{effPaidWith}</span>
            </div>

            <Dashed />

            {/* items */}
            <div className="flex flex-col gap-2 text-[9px] leading-3">
              {effItems.map((item) => (
                <div key={item.name} className="grid grid-cols-[auto_1fr_auto] gap-x-2">
                  <span className="font-bold text-[#0C831F]">{item.qty}×</span>
                  <span className="min-w-0">
                    <span className="block truncate">{item.name}</span>
                    <span className="text-[#666]">{item.unit}</span>
                  </span>
                  <span>{rupee(item.qty * item.price)}</span>
                </div>
              ))}
            </div>

            <Dashed />

            {/* bill */}
            <div className="flex flex-col gap-1 text-[9px] leading-3">
              <BillRow label="Item total" value={rupee(itemTotal)} />
              <BillRow
                label="Delivery charge"
                strike={effDeliveryFee === 0 && deliveryFeeStrike ? rupee(deliveryFeeStrike) : undefined}
                value={effDeliveryFee === 0 ? "FREE" : rupee(effDeliveryFee)}
                free={effDeliveryFee === 0}
              />
              <BillRow label="Handling charge" value={rupee(effHandlingFee)} />
            </div>

            <div className="mt-3 flex items-baseline justify-between rounded-md bg-[#F7D61D] px-2 py-2">
              <span className="text-[10px] font-extrabold">Grand total</span>
              <span className="text-xs font-extrabold">{rupee(grandTotal)}</span>
            </div>

            {effSavings > 0 && (
              <div className="mt-3 rounded-md bg-[#E8F5EA] px-2 py-2 text-center text-[9px] font-bold leading-3 text-[#0C831F]">
                You saved {rupee(effSavings)} on this order
              </div>
            )}

            {/* barcode */}
            <div className="mt-5 text-center">
              <div className="mx-auto h-7 w-32 bg-[repeating-linear-gradient(90deg,currentColor_0_1px,transparent_1px_3px,currentColor_3px_5px,transparent_5px_7px,currentColor_7px_8px,transparent_8px_11px)]" />
              <p className="mt-1 text-[7px] tracking-[0.18em] text-[#666]">{effOrderId.replace("-", " ")}</p>
            </div>

            <p className="mt-4 text-center text-[9px] font-bold leading-3">
              Thank you for ordering on blink<span className="text-[#0C831F]">it</span>
            </p>
          </article>
        </motion.div>
      </div>
    </section>
  );
});

export default BlinkitPrinter;