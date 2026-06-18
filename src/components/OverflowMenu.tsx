import { useEffect, useRef, useState } from "react";

export interface MenuItem {
  label: string;
  onClick: () => void;
  /** Render in the danger (red) style — used for destructive actions. */
  danger?: boolean;
}

/**
 * A compact "⋯" overflow menu for secondary header actions. Keeping these out of
 * the main header bar stops it from breaking when the window is narrowed.
 * Closes on outside click, Escape, or selecting an item.
 */
export function OverflowMenu({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="menu" ref={ref}>
      <button
        className="menu__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="More actions"
      >
        ⋯
      </button>
      {open && (
        <div className="menu__list" role="menu">
          {items.map((item, i) => (
            <button
              key={i}
              role="menuitem"
              className={item.danger ? "menu__item menu__item--danger" : "menu__item"}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
