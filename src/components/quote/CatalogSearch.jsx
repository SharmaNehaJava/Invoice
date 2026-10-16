import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { CATALOG_ITEMS } from "../../data/catalogData";
import { formatMoney } from "../../lib/pricing";

function matchesSearch(item, term) {
  const haystack = [item.model, item.variant, item.partNumber, item.brand, item.category]
    .join(" ")
    .toLowerCase();
  return term
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

// Type-ahead over the price book. Picking a result adds it to the quote.
export default function CatalogSearch({ onAdd, inQuote = {} }) {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const results = useMemo(
    () => (term.trim() ? CATALOG_ITEMS.filter((i) => matchesSearch(i, term)) : CATALOG_ITEMS),
    [term]
  );

  const choose = (item) => {
    onAdd(item);
    setTerm("");
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && open && results[highlight]) {
      e.preventDefault();
      choose(results[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <label htmlFor="catalog-search" className="sr-only">
        Search catalogue
      </label>
      <div className="flex h-11 items-center gap-2 rounded-lg border border-line-strong bg-panel px-3 focus-within:border-accent">
        <Search size={18} className="text-text-dim" aria-hidden="true" />
        <input
          id="catalog-search"
          type="search"
          autoComplete="off"
          placeholder="Add equipment — model, part number or description"
          value={term}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onChange={(e) => {
            setTerm(e.target.value);
            setHighlight(0);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={open}
          aria-controls="catalog-results"
          className="w-full bg-transparent text-sm text-text-main placeholder:text-text-dim focus:outline-none"
        />
      </div>

      {open && (
        <ul
          id="catalog-results"
          role="listbox"
          className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-line bg-panel p-1 shadow-xl"
        >
          {results.length === 0 && (
            <li className="px-3 py-4 text-center text-sm text-text-dim">
              Nothing matches “{term}”. Use “Custom item” for anything not in the price book.
            </li>
          )}
          {results.map((item, idx) => (
            <li
              key={item.id}
              role="option"
              aria-selected={idx === highlight}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(item)}
              onMouseEnter={() => setHighlight(idx)}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 ${
                idx === highlight ? "bg-panel-hover" : ""
              }`}
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-text-main">
                  {item.model} <span className="font-normal text-text-muted">— {item.variant}</span>
                </div>
                <div className="font-data text-xs text-text-dim">
                  {[item.partNumber, item.brand, item.category].filter(Boolean).join(" · ")}
                  {inQuote[item.id] ? ` · ${inQuote[item.id]} on quote` : ""}
                </div>
              </div>
              <span className="flex shrink-0 items-center gap-2">
                <span className="font-data text-sm font-medium text-text-main">{formatMoney(item.listPrice)}</span>
                <Plus size={16} className="text-text-dim" aria-hidden="true" />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
