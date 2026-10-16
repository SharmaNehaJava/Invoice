import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button, NumberInput } from "../ui";
import { MARGIN_PRESETS, TARGET_MARGIN, formatMoney, marginForPrice } from "../../lib/pricing";

// Work backwards from a price agreed with the customer to the margin it gives.
function TargetPrice({ totalCost, sellPrice, onMargin }) {
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  const apply = () => {
    if (price === "") return;
    if (Number(price) <= totalCost) {
      setError(`Below cost (${formatMoney(totalCost)}). Enter a higher price.`);
      return;
    }
    onMargin(marginForPrice(totalCost, price));
    setPrice("");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
      className="border-t border-line pt-3"
    >
      <label htmlFor="target-price" className="mb-1 block text-xs font-medium text-text-muted">
        Or start from the customer's price
      </label>
      <div className="flex gap-2">
        <NumberInput
          id="target-price"
          value={price}
          onChange={(v) => {
            setPrice(v);
            setError("");
          }}
          prefix="$"
          step="100"
          className="flex-1"
        />
        <Button type="submit">Set margin</Button>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-error">{error}</p>
      ) : (
        <p className="mt-1 text-xs text-text-dim">Currently {formatMoney(sellPrice, 2)}</p>
      )}
    </form>
  );
}

export default function MarginControl({ value, onChange, totalCost, sellPrice }) {
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
        <Button aria-label="Lower margin by 0.5%" onClick={() => step(-0.5)} className="w-10 px-0">
          <Minus size={16} />
        </Button>
        <NumberInput id="margin" value={value} onChange={onChange} suffix="%" step="0.5" className="w-28 shrink-0" />
        <Button aria-label="Raise margin by 0.5%" onClick={() => step(0.5)} className="w-10 px-0">
          <Plus size={16} />
        </Button>
        <span className={`text-xs ${below ? "text-warning" : above ? "text-info" : "text-text-dim"}`}>
          {below ? "Below the 17–20% target" : above ? "Above target" : "Target 17–20%"}
        </span>
      </div>
      {totalCost > 0 && <TargetPrice totalCost={totalCost} sellPrice={sellPrice} onMargin={onChange} />}
    </div>
  );
}
