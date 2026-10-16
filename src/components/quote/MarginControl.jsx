import { Minus, Plus } from "lucide-react";
import { Button, NumberInput } from "../ui";
import { MARGIN_PRESETS, TARGET_MARGIN } from "../../lib/pricing";

export default function MarginControl({ value, onChange }) {
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
          {below ? "Below the 17–20% target" : above ? "Above target — Sheldon will like it" : "Target 17–20%"}
        </span>
      </div>
    </div>
  );
}
