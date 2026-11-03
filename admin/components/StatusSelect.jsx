import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ORDER_STATUSES, STATUS_STYLES } from "../data/adminData";

export default function StatusSelect({ value, onChange }) {
  const optionsId = useId();
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const [activeIndex, setActiveIndex] = useState(
    Math.max(0, ORDER_STATUSES.findIndex((status) => status.value === value))
  );
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const selectedIndex = ORDER_STATUSES.findIndex((status) => status.value === value);
  const selectedStatus = ORDER_STATUSES[selectedIndex] || ORDER_STATUSES[0];
  const style = STATUS_STYLES[selectedStatus.value] || STATUS_STYLES.pending;

  

  const openMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const menuHeight = ORDER_STATUSES.length * 38 + 8;
    const openAbove = window.innerHeight - rect.bottom < menuHeight && rect.top > menuHeight;
    setMenuPosition({
      left: Math.max(8, Math.min(rect.left, window.innerWidth - Math.max(rect.width, 176) - 8)),
      top: openAbove ? rect.top - menuHeight - 4 : rect.bottom + 4,
      width: Math.max(rect.width, 176),
    });
    setActiveIndex(Math.max(0, selectedIndex));
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsideClick = (event) => {
      if (
        !triggerRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    const closeOnViewportChange = () => setOpen(false);

    document.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("resize", closeOnViewportChange);
    window.addEventListener("scroll", closeOnViewportChange, true);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("resize", closeOnViewportChange);
      window.removeEventListener("scroll", closeOnViewportChange, true);
    };
  }, [open]);

  const selectStatus = (status) => {
    onChange(status.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => (index + direction + ORDER_STATUSES.length) % ORDER_STATUSES.length);
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) {
        openMenu();
      } else {
        selectStatus(ORDER_STATUSES[activeIndex]);
      }
    }
  };

  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Order status"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={optionsId}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        className={`dispatch-status-select relative inline-flex cursor-pointer items-center justify-between gap-3 rounded-full py-1 pl-6 pr-2 font-label-sm text-label-sm font-bold outline-none ${style.pill}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute left-2.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full ${style.dot} ${selectedStatus.value === "in-transit" ? "animate-pulse" : ""}`}
        />
        <span>{selectedStatus.label}</span>
        <span aria-hidden="true" className="material-symbols-outlined text-[16px] leading-none">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>

      {open && menuPosition && createPortal(
        <div
          ref={menuRef}
          id={optionsId}
          role="listbox"
          aria-label="Dispatch status"
          className="dispatch-status-menu"
          style={{
            left: menuPosition.left,
            top: menuPosition.top,
            width: menuPosition.width,
          }}
        >
          {ORDER_STATUSES.map((status, index) => {
            const optionStyle = STATUS_STYLES[status.value] || STATUS_STYLES.pending;
            const selected = status.value === value;
            return (
              <button
                key={status.value}
                type="button"
                role="option"
                aria-selected={selected}
                className={`dispatch-status-option ${selected ? "is-selected" : ""} ${index === activeIndex ? "is-active" : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectStatus(status)}
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${optionStyle.dot}`} />
                <span className="flex-1 text-left">{status.label}</span>
                {selected && (
                  <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                    check
                  </span>
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
