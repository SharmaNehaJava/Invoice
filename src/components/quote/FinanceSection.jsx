import { Field, NumberInput, inputClass } from "../ui";
import { CUSTOM_PROGRAM_ID, FINANCE_PROGRAMS } from "../../data/catalogData";
import { formatRate } from "../../lib/pricing";

export default function FinanceSection({ draft, update }) {
  const isCustom = draft.programId === CUSTOM_PROGRAM_ID;
  const program = FINANCE_PROGRAMS.find((p) => p.id === draft.programId);
  const brand = draft.lines[0]?.brand;
  const autoPicked = brand && program?.brands.includes(brand);

  return (
    <div className="space-y-3">
      <Field label="Finance bulletin" htmlFor="program" hint={autoPicked ? `Picked for ${brand}` : undefined}>
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
            <NumberInput id="custom-rate" value={draft.customRate} onChange={(v) => update({ customRate: v })} suffix="%" step="0.01" />
          </Field>
          <Field label="Term" htmlFor="custom-months">
            <NumberInput id="custom-months" value={draft.customMonths} onChange={(v) => update({ customMonths: v })} suffix="mo" step="1" />
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

      <div className="grid grid-cols-2 gap-3">
        <Field label="Down payment" htmlFor="down-payment">
          <NumberInput id="down-payment" value={draft.downPayment} onChange={(v) => update({ downPayment: v })} prefix="$" step="100" />
        </Field>
        <Field label="Trade-in allowance" htmlFor="trade-in">
          <NumberInput id="trade-in" value={draft.tradeIn} onChange={(v) => update({ tradeIn: v })} prefix="$" step="500" />
        </Field>
      </div>
    </div>
  );
}
