import { useMemo, useRef, useState } from "react";
import { Copy, Mail, Minus, Plus, RotateCcw, Save, Search, Share2 } from "lucide-react";
import { Badge, Button, Card, CardHeader, Field, NumberInput, inputClass } from "../components/ui";
import {
  CATALOG_ITEMS,
  CUSTOM_PROGRAM_ID,
  FINANCE_PROGRAMS,
  YARD_STOCK,
} from "../data/catalogData";
import {
  MARGIN_PRESETS,
  TARGET_MARGIN,
  costSheetText,
  customerQuoteText,
  financeQuote,
  formatMoney,
  formatRate,
  machineLabel,
  priceQuote,
} from "../lib/pricing";
import { activeFinance, draftForItem, findItem, newDraft } from "../lib/quoteDraft";
import { canShare, copyText, shareText } from "../lib/clipboard";

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

function CatalogSearch({ onSelect }) {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const results = useMemo(
    () => (term.trim() ? CATALOG_ITEMS.filter((i) => matchesSearch(i, term)) : CATALOG_ITEMS),
    [term]
  );

  const choose = (item) => {
    onSelect(item);
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
          placeholder="Search model, part number or description — DW30, 5100069205, plate"
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
            <li className="px-3 py-4 text-center text-sm text-text-dim">No catalogue lines match “{term}”.</li>
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
                </div>
              </div>
              <span className="font-data shrink-0 text-sm font-medium text-text-main">
                {formatMoney(item.listPrice)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MarginControl({ value, onChange }) {
  const below = value < TARGET_MARGIN.min;
  const above = value > TARGET_MARGIN.max;
  const step = (delta) => onChange(Math.max(0, Math.round((Number(value) + delta) * 10) / 10));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {MARGIN_PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-pressed={value === p}
            className={`font-data h-9 min-w-12 rounded-lg border px-2 text-sm transition-colors ${
              value === p
                ? "border-accent bg-accent font-semibold text-accent-ink"
                : "border-line-strong bg-panel text-text-muted hover:border-accent hover:text-text-main"
            }`}
          >
            {p}%
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="md" aria-label="Lower margin by 0.5%" onClick={() => step(-0.5)} className="w-10 px-0">
          <Minus size={16} />
        </Button>
        <NumberInput id="margin" value={value} onChange={onChange} suffix="%" step="0.5" className="w-28 shrink-0" />
        <Button size="md" aria-label="Raise margin by 0.5%" onClick={() => step(0.5)} className="w-10 px-0">
          <Plus size={16} />
        </Button>
        <span className={`text-xs ${below ? "text-warning" : above ? "text-info" : "text-text-dim"}`}>
          {below ? "Below the 17–20% target" : above ? "Above target — Sheldon will like it" : "Target 17–20%"}
        </span>
      </div>
    </div>
  );
}

function FinanceSection({ draft, update, item }) {
  const isCustom = draft.programId === CUSTOM_PROGRAM_ID;
  const program = FINANCE_PROGRAMS.find((p) => p.id === draft.programId);
  const autoPicked = program?.brands.includes(item.brand);

  return (
    <div className="space-y-3">
      <Field label="Finance bulletin" htmlFor="program" hint={autoPicked ? `Picked for ${item.brand}` : undefined}>
        <select
          id="program"
          value={draft.programId}
          onChange={(e) => update({ programId: e.target.value, rateIndex: 0 })}
          className={inputClass}
        >
          {FINANCE_PROGRAMS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — valid to {p.validTo}
            </option>
          ))}
          <option value={CUSTOM_PROGRAM_ID}>No programme — enter your own</option>
        </select>
      </Field>

      {isCustom ? (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Rate" htmlFor="custom-rate">
            <NumberInput
              id="custom-rate"
              value={draft.customRate}
              onChange={(v) => update({ customRate: v })}
              suffix="%"
              step="0.01"
            />
          </Field>
          <Field label="Term" htmlFor="custom-months">
            <NumberInput
              id="custom-months"
              value={draft.customMonths}
              onChange={(v) => update({ customMonths: v })}
              suffix="mo"
              step="1"
            />
          </Field>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Rate and term">
          {program.rates.map((r, idx) => (
            <button
              key={idx}
              type="button"
              role="radio"
              aria-checked={draft.rateIndex === idx}
              onClick={() => update({ rateIndex: idx })}
              className={`font-data h-9 rounded-lg border px-3 text-sm ${
                draft.rateIndex === idx
                  ? "border-accent bg-accent-subtle font-semibold text-accent-text"
                  : "border-line-strong text-text-muted hover:border-accent"
              }`}
            >
              {formatRate(r.ratePercent, r.months)}
            </button>
          ))}
        </div>
      )}

      <Field label="Down payment" htmlFor="down-payment">
        <NumberInput
          id="down-payment"
          value={draft.downPayment}
          onChange={(v) => update({ downPayment: v })}
          prefix="$"
          step="100"
        />
      </Field>
    </div>
  );
}

function SummaryRow({ label, value, strong, tone }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-text-muted">{label}</span>
      <span
        className={`font-data ${strong ? "font-semibold text-text-main" : "text-text-main"} ${
          tone === "success" ? "text-success" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function QuotePage({ draft, setDraft, customers, repName, onSaveQuote, notify }) {
  const customerRef = useRef(null);
  const [customerError, setCustomerError] = useState("");

  const item = findItem(draft.itemId);
  const update = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const pricing = priceQuote(draft);
  const { programName, rate } = activeFinance(draft);
  const finance = financeQuote({
    sellPrice: pricing.sellPrice,
    downPayment: draft.downPayment,
    ratePercent: rate.ratePercent,
    months: rate.months,
  });

  const stock = YARD_STOCK.filter((s) => s.model === item.model);
  const textArgs = { item, inputs: draft, pricing, finance, rate, programName, customer: draft.customer };

  const requireCustomer = () => {
    if (draft.customer.trim()) return true;
    setCustomerError("Add a customer to save this quote.");
    customerRef.current?.focus();
    return false;
  };

  const save = (status) => {
    const id = onSaveQuote(draft, { status, machine: machineLabel(item), sellPrice: pricing.sellPrice });
    update({ quoteId: id });
    return id;
  };

  const handleCopyCustomer = async () => {
    const ok = await copyText(customerQuoteText({ ...textArgs, repName }));
    notify(ok ? "Customer quote copied — paste it into your text" : "Couldn't copy. Select the text manually.", ok ? "success" : "error");
  };

  const handleShareCustomer = () => shareText(customerQuoteText({ ...textArgs, repName }), "CC Equipment quote");

  const handleSendToSheldon = async () => {
    if (!requireCustomer()) return;
    const ok = await copyText(costSheetText(textArgs));
    save("review");
    notify(ok ? "Cost sheet copied and saved as With Sheldon" : "Saved as With Sheldon. Copy failed — try again.", ok ? "success" : "error");
  };

  const mailtoHref = `mailto:?subject=${encodeURIComponent(
    `Cost sheet for review — ${draft.customer || machineLabel(item)}`
  )}&body=${encodeURIComponent(costSheetText(textArgs))}`;

  const handleSave = () => {
    if (!requireCustomer()) return;
    save("draft");
    notify(`Quote saved to ${draft.customer}`, "success");
  };

  const handleNewQuote = () => {
    setDraft(newDraft());
    setCustomerError("");
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      {/* Builder */}
      <div className="min-w-0 space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_260px]">
          <CatalogSearch onSelect={(next) => setDraft((d) => draftForItem(next, d))} />
          <div>
            <label htmlFor="customer" className="sr-only">
              Customer
            </label>
            <input
              ref={customerRef}
              id="customer"
              list="customer-options"
              placeholder="Customer — RG Excavating"
              value={draft.customer}
              onChange={(e) => {
                update({ customer: e.target.value });
                setCustomerError("");
              }}
              aria-invalid={Boolean(customerError)}
              aria-describedby={customerError ? "customer-error" : undefined}
              className={`${inputClass} h-11 ${customerError ? "border-error" : ""}`}
            />
            <datalist id="customer-options">
              {customers.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
            {customerError && (
              <p id="customer-error" className="mt-1 text-xs text-error">
                {customerError}
              </p>
            )}
          </div>
        </div>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-text-main">{item.model}</h2>
                <Badge>{item.brand}</Badge>
                {draft.quoteId && <Badge tone="info">Editing {draft.quoteId}</Badge>}
              </div>
              <p className="text-sm text-text-muted">
                {item.variant}
                {item.partNumber && <span className="font-data text-text-dim"> · {item.partNumber}</span>}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleNewQuote}>
              <RotateCcw size={14} aria-hidden="true" />
              New quote
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
            <Field label="List price" htmlFor="list-price">
              <NumberInput id="list-price" value={draft.listPrice} onChange={(v) => update({ listPrice: v })} prefix="$" />
            </Field>
            <Field label="Less (dealer discount)" htmlFor="discount">
              <NumberInput id="discount" value={draft.discountPct} onChange={(v) => update({ discountPct: v })} suffix="%" step="0.5" />
            </Field>
            <Field label="PDI" htmlFor="pdi">
              <NumberInput id="pdi" value={draft.pdi} onChange={(v) => update({ pdi: v })} prefix="$" step="10" />
            </Field>
            <Field label="Factory freight" htmlFor="freight">
              <NumberInput id="freight" value={draft.freight} onChange={(v) => update({ freight: v })} prefix="$" step="50" />
            </Field>
          </div>

          <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-t border-line bg-subtle px-4 py-2.5 text-sm">
            <span className="text-text-muted">
              Dealer cost <span className="font-data text-text-main">{formatMoney(pricing.dealerCost, 2)}</span>
            </span>
            <span className="text-text-muted">
              Total cost <span className="font-data font-semibold text-text-main">{formatMoney(pricing.totalCost, 2)}</span>
            </span>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader title="Margin" subtitle="On sell price: cost ÷ (1 − margin)" />
            <div className="p-4">
              <MarginControl value={draft.marginPct} onChange={(v) => update({ marginPct: v })} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Finance" />
            <div className="p-4">
              <FinanceSection draft={draft} update={update} item={item} />
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="On the ground"
            subtitle={`Yard units matching ${item.model}`}
            action={<Badge tone={stock.length ? "success" : "neutral"}>{stock.length} in yard</Badge>}
          />
          {stock.length ? (
            <ul className="divide-y divide-line">
              {stock.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                  <div>
                    <div className="text-sm font-medium text-text-main">
                      {s.year} {s.model} <span className="font-normal text-text-muted">— {s.description}</span>
                    </div>
                    <div className="font-data text-xs text-text-dim">{s.serialNumber}</div>
                  </div>
                  <Badge>{s.branch}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm text-text-dim">No matching units in the yard — order from the factory.</p>
          )}
        </Card>
      </div>

      {/* Summary */}
      <aside className="xl:sticky xl:top-18 xl:self-start">
        <Card>
          <div className="space-y-1 px-4 pb-3 pt-4">
            <p className="text-xs font-medium text-text-muted">Sell price</p>
            <p className="font-data text-3xl font-semibold text-text-main">{formatMoney(pricing.sellPrice, 2)}</p>
            <p className="text-xs text-text-dim">
              {draft.marginPct}% margin · gross profit{" "}
              <span className="font-data text-success">{formatMoney(pricing.grossProfit, 2)}</span>
            </p>
          </div>

          <div className="space-y-2 border-t border-line px-4 py-3">
            <p className="text-xs text-text-dim">
              {programName} · {formatRate(rate.ratePercent, rate.months)}
            </p>
            <SummaryRow label="Monthly" value={formatMoney(finance.monthly, 2)} strong />
            <SummaryRow label="Per day (20 working days)" value={formatMoney(finance.daily, 2)} />
            <SummaryRow label="Per hour (8 h day)" value={formatMoney(finance.hourly, 2)} />
          </div>

          <div className="space-y-2 border-t border-line p-4">
            <div className="flex gap-2">
              <Button variant="primary" size="lg" className="flex-1" onClick={handleCopyCustomer}>
                <Copy size={16} aria-hidden="true" />
                Copy for customer
              </Button>
              {canShare() && (
                <Button size="lg" aria-label="Share customer quote" onClick={handleShareCustomer} className="w-11 px-0">
                  <Share2 size={16} />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="lg" className="flex-1" onClick={handleSendToSheldon}>
                Cost sheet to Sheldon
              </Button>
              <a
                href={mailtoHref}
                aria-label="Open cost sheet in email"
                title="Open in email"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line-strong text-text-main hover:bg-panel-hover"
              >
                <Mail size={16} />
              </a>
            </div>
            <Button variant="ghost" size="lg" className="w-full" onClick={handleSave}>
              <Save size={16} aria-hidden="true" />
              {draft.quoteId ? `Update ${draft.quoteId}` : "Save to customer"}
            </Button>
          </div>
        </Card>
      </aside>

      {/* Phone: keep the number and the main action in reach */}
      <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-30 flex items-center gap-3 border-t border-line bg-panel px-4 py-2 lg:bottom-0 lg:left-60 xl:hidden">
        <div className="min-w-0 flex-1">
          <p className="font-data truncate text-lg font-semibold text-text-main">{formatMoney(pricing.sellPrice)}</p>
          <p className="font-data text-xs text-text-dim">
            {formatMoney(finance.daily, 2)}/day · {formatMoney(finance.hourly, 2)}/hr
          </p>
        </div>
        <Button variant="primary" onClick={handleCopyCustomer}>
          <Copy size={16} aria-hidden="true" />
          Copy
        </Button>
      </div>
    </div>
  );
}
