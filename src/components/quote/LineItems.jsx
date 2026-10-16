import { Minus, Plus, X } from "lucide-react";
import { Badge, Button, Field, NumberInput, inputClass } from "../ui";
import { formatMoney, toNumber } from "../../lib/pricing";

function QtyStepper({ id, value, onChange }) {
  const qty = Math.max(1, toNumber(value));
  return (
    <div className="flex h-10 items-center rounded-lg border border-line-strong">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(1, qty - 1))}
        className="flex h-full w-9 items-center justify-center text-text-muted hover:text-text-main"
      >
        <Minus size={14} />
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min="1"
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Math.max(1, Math.round(Number(e.target.value))))}
        className="font-data w-full min-w-0 bg-transparent text-center text-sm text-text-main focus:outline-none"
      />
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(qty + 1)}
        className="flex h-full w-9 items-center justify-center text-text-muted hover:text-text-main"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

function LineItem({ row, index, onChange, onRemove }) {
  const { line } = row;
  const id = (field) => `line-${line.key}-${field}`;
  const isCustom = !line.itemId;

  return (
    <li className="space-y-3 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {isCustom ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_160px]">
              <div>
                <label htmlFor={id("name")} className="sr-only">
                  Description
                </label>
                <input
                  id={id("name")}
                  value={line.model}
                  onChange={(e) => onChange({ model: e.target.value })}
                  placeholder="Description — Avant weed brush"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor={id("part")} className="sr-only">
                  Part number
                </label>
                <input
                  id={id("part")}
                  value={line.partNumber}
                  onChange={(e) => onChange({ partNumber: e.target.value })}
                  placeholder="Part no. — A36594"
                  className={`${inputClass} font-data`}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-text-main">{line.model}</span>
                {index === 0 && <Badge tone="accent">Main unit</Badge>}
                <Badge>{line.brand}</Badge>
              </div>
              <p className="text-sm text-text-muted">
                {line.variant}
                {line.partNumber && <span className="font-data text-text-dim"> · {line.partNumber}</span>}
              </p>
            </>
          )}
        </div>
        <Button variant="ghost" size="sm" aria-label={`Remove ${line.model || "item"}`} onClick={onRemove} className="w-8 px-0">
          <X size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[110px_repeat(3,minmax(0,1fr))_auto] sm:items-end">
        <Field label="Qty" htmlFor={id("qty")}>
          <QtyStepper id={id("qty")} value={line.qty} onChange={(qty) => onChange({ qty })} />
        </Field>
        <Field label="List price (each)" htmlFor={id("list")}>
          <NumberInput id={id("list")} value={line.listPrice} onChange={(v) => onChange({ listPrice: v })} prefix="$" />
        </Field>
        <Field label="Less" htmlFor={id("less")}>
          <NumberInput id={id("less")} value={line.discountPct} onChange={(v) => onChange({ discountPct: v })} suffix="%" step="0.5" />
        </Field>
        <Field label="PDI (each)" htmlFor={id("pdi")}>
          <NumberInput id={id("pdi")} value={line.pdi} onChange={(v) => onChange({ pdi: v })} prefix="$" step="10" />
        </Field>
        <div className="col-span-2 flex items-baseline justify-between gap-2 sm:col-span-1 sm:block sm:pb-2 sm:text-right">
          <span className="text-xs text-text-dim">Cost</span>
          <div className="font-data text-sm font-semibold text-text-main">{formatMoney(row.cost, 2)}</div>
        </div>
      </div>
    </li>
  );
}

export default function LineItems({ draft, pricing, setDraft }) {
  const updateLine = (key, patch) =>
    setDraft((d) => ({ ...d, lines: d.lines.map((l) => (l.key === key ? { ...l, ...patch } : l)) }));
  const removeLine = (key) => setDraft((d) => ({ ...d, lines: d.lines.filter((l) => l.key !== key) }));

  if (!pricing.rows.length) {
    return (
      <p className="px-4 py-8 text-center text-sm text-text-dim">
        Search the price book above to add a machine, then add its attachments.
      </p>
    );
  }

  return (
    <>
      <ul className="divide-y divide-line">
        {pricing.rows.map((row, index) => (
          <LineItem
            key={row.line.key}
            row={row}
            index={index}
            onChange={(patch) => updateLine(row.line.key, patch)}
            onRemove={() => removeLine(row.line.key)}
          />
        ))}
      </ul>

      <div className="grid grid-cols-1 gap-3 border-t border-line bg-subtle px-4 py-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-end">
        <Field label="Factory freight (whole quote)" htmlFor="freight">
          <NumberInput
            id="freight"
            value={draft.freight}
            onChange={(v) => setDraft((d) => ({ ...d, freight: v }))}
            prefix="$"
            step="50"
          />
        </Field>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm sm:justify-self-end sm:text-right">
          <dt className="text-text-muted">Dealer cost</dt>
          <dd className="font-data text-text-main">{formatMoney(pricing.dealerCost, 2)}</dd>
          <dt className="text-text-muted">PDI</dt>
          <dd className="font-data text-text-main">{formatMoney(pricing.pdiTotal, 2)}</dd>
          <dt className="font-medium text-text-main">Total cost</dt>
          <dd className="font-data font-semibold text-text-main">{formatMoney(pricing.totalCost, 2)}</dd>
        </dl>
      </div>
    </>
  );
}
