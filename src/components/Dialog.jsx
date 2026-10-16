import { useEffect, useRef } from "react";
import { X } from "lucide-react";

// Centered modal on desktop, bottom sheet on phones. Escape or the backdrop closes it.
export default function Dialog({ title, onClose, children, wide = false }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.activeElement;
    panelRef.current?.querySelector("input, textarea, select, button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4 print:hidden"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-line bg-panel shadow-2xl sm:rounded-2xl ${
          wide ? "sm:max-w-2xl" : "sm:max-w-lg"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-panel px-4 py-3">
          <h2 className="text-base font-semibold text-text-main">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-lg text-text-muted hover:bg-panel-hover hover:text-text-main"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
