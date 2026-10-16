import { Copy } from "lucide-react";
import { Button, Card, CardHeader, Field, NumberInput, Segmented } from "../ui";
import { HOURS_PER_MONTH, formatMoney, lineLabel, ownVsRent, toNumber } from "../../lib/pricing";
import { copyText } from "../../lib/clipboard";

const USAGE_PRESETS = [80, 120, 160];

function Stat({ label, value, sub, tone }) {
  return (
    <div className="rounded-lg bg-subtle p-3">
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`font-data text-lg font-semibold ${tone === "success" ? "text-success" : "text-text-main"}`}>{value}</p>
      {sub && <p className="text-xs text-text-dim">{sub}</p>}
    </div>
  );
}

export default function OwnVsRent({ draft, update, finance, rate, notify }) {
  const mainLine = draft.lines[0];
  const sheetRate = toNumber(mainLine?.rentalMonthly) * Math.max(1, toNumber(mainLine?.qty));
  const rentalMonthly = draft.rentalMonthly === "" ? sheetRate : toNumber(draft.rentalMonthly);
  const usage = toNumber(draft.usageHours);

  const result = ownVsRent({
    monthly: finance.monthly,
    rentalMonthly,
    usageHours: usage,
    months: rate.months,
    upfront: toNumber(draft.downPayment) + toNumber(draft.tradeIn),
  });

  const ready = finance.monthly > 0 && rentalMonthly > 0;
  const machine = mainLine ? lineLabel(mainLine) : "this machine";
  const days = Math.ceil(result.breakEvenDays * 10) / 10;

  const pitch =
    `Renting ${machine} is ${formatMoney(rentalMonthly)} a month. ` +
    `Owning it is ${formatMoney(finance.monthly, 2)} a month, so it pays for itself after about ` +
    `${Math.round(result.breakEvenHours)} hours — roughly ${days} working days. ` +
    `Every hour after that is money you keep. ` +
    `Over ${result.term} months, renting full-time is ${formatMoney(result.rentTotal)}; ` +
    `owning is ${formatMoney(result.ownTotal)}. That's ${formatMoney(result.savings)} saved, and you own the machine.`;

  const handleCopy = async () => {
    const ok = await copyText(pitch);
    notify(ok ? "Own-vs-rent pitch copied" : "Couldn't copy the pitch", ok ? "success" : "error");
  };

  return (
    <Card>
      <CardHeader
        title="Own vs rent"
        subtitle={mainLine ? `Based on ${machine}` : "Add a machine to compare"}
        action={
          ready && (
            <Button size="sm" onClick={handleCopy}>
              <Copy size={14} aria-hidden="true" />
              Copy pitch
            </Button>
          )
        }
      />
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="Rental rate (per month)"
            htmlFor="rental-monthly"
            hint={draft.rentalMonthly === "" ? "From the rental sheet" : "Edited — clear it to use the rental sheet"}
          >
            <NumberInput
              id="rental-monthly"
              value={draft.rentalMonthly === "" ? sheetRate || "" : draft.rentalMonthly}
              onChange={(v) => update({ rentalMonthly: v === sheetRate ? "" : v })}
              prefix="$"
              step="100"
            />
          </Field>
          <Field label="Customer's use (hours per month)" htmlFor="usage-hours" hint={`A full month is ${HOURS_PER_MONTH} hours`}>
            <div className="flex flex-wrap items-center gap-2">
              <NumberInput
                id="usage-hours"
                value={draft.usageHours}
                onChange={(v) => update({ usageHours: v })}
                suffix="h"
                step="8"
                className="w-28 shrink-0"
              />
              <Segmented
                options={USAGE_PRESETS.map((h) => ({ value: h, label: `${h}h` }))}
                value={usage}
                onChange={(h) => update({ usageHours: h })}
              />
            </div>
          </Field>
        </div>

        {ready ? (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat
                label="Pays for itself after"
                value={`${Math.round(result.breakEvenHours)} h`}
                sub={`≈ ${days} working days a month`}
              />
              <Stat
                label="Rent per hour"
                value={formatMoney(result.rentPerHour, 2)}
                sub={`${formatMoney(rentalMonthly)} ÷ ${HOURS_PER_MONTH} h`}
              />
              <Stat
                label="Own per hour"
                value={formatMoney(result.ownPerHour, 2)}
                sub={`At ${usage} h a month`}
              />
              <Stat
                label="Hours past break-even"
                value={`${Math.round(result.hoursAfterBreakEven)} h`}
                sub="Earning, not paying"
                tone="success"
              />
            </div>

            <dl className="space-y-1.5 rounded-lg border border-line p-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Renting full-time for {result.term} months</dt>
                <dd className="font-data text-text-main">{formatMoney(result.rentTotal)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Owning (payments + down payment + trade-in)</dt>
                <dd className="font-data text-text-main">{formatMoney(result.ownTotal)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-line pt-1.5 font-semibold">
                <dt className="text-text-main">Saved by owning</dt>
                <dd className="font-data text-success">{formatMoney(result.savings)}</dd>
              </div>
              <p className="pt-1 text-xs text-text-dim">Before resale value — the machine is still worth something at the end.</p>
            </dl>
          </>
        ) : (
          <p className="text-sm text-text-dim">
            {finance.monthly > 0
              ? "Enter the monthly rental rate to compare."
              : "Pick a finance option above to compare owning with renting."}
          </p>
        )}
      </div>
    </Card>
  );
}
