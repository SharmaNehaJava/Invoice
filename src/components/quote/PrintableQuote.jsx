import { formatMoney, formatRate, lineLabel, toNumber } from "../../lib/pricing";

// Only visible when printing; "Print / save PDF" uses the browser's print dialog.
export default function PrintableQuote({ draft, pricing, finance, rate, otherRates, repName, branch }) {
  const today = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  const itemize = draft.itemize && pricing.rows.length > 1;

  return (
    <div className="hidden bg-white p-8 text-[13px] text-black print:block">
      <div className="mb-6 flex items-start justify-between border-b border-black/20 pb-4">
        <div>
          <p className="text-xl font-bold">CC Equipment</p>
          <p>{branch}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">Quote {draft.quoteId ?? ""}</p>
          <p>{today}</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase text-black/60">Prepared for</p>
          <p className="font-semibold">{draft.customer || "—"}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-black/60">Prepared by</p>
          <p className="font-semibold">{repName || "—"}</p>
        </div>
      </div>

      <table className="mb-6 w-full border-collapse">
        <thead>
          <tr className="border-b border-black/30 text-left">
            <th className="py-2 pr-2">Qty</th>
            <th className="py-2 pr-2">Description</th>
            <th className="py-2 pr-2">Part no.</th>
            {itemize && <th className="py-2 text-right">Price</th>}
          </tr>
        </thead>
        <tbody>
          {pricing.rows.map((row) => (
            <tr key={row.line.key} className="border-b border-black/10">
              <td className="py-2 pr-2">{row.qty}</td>
              <td className="py-2 pr-2">{lineLabel(row.line) || "Item"}</td>
              <td className="py-2 pr-2">{row.line.partNumber}</td>
              {itemize && <td className="py-2 text-right">{formatMoney(row.sellPrice, 2)}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mb-6 ml-auto w-72 space-y-1">
        <div className="flex justify-between text-base font-bold">
          <span>Price</span>
          <span>{formatMoney(pricing.sellPrice, 2)}</span>
        </div>
        {toNumber(draft.tradeIn) > 0 && (
          <div className="flex justify-between">
            <span>Less trade-in</span>
            <span>-{formatMoney(draft.tradeIn, 2)}</span>
          </div>
        )}
        <p className="text-xs text-black/60">Includes PDI and freight. Taxes extra.</p>
      </div>

      {finance.monthly > 0 && (
        <div className="mb-6 rounded border border-black/20 p-4">
          <p className="mb-2 font-semibold">Financing (on approved credit)</p>
          <p>
            {formatMoney(finance.monthly, 2)}/month — {formatRate(rate.ratePercent, rate.months)}
            {toNumber(draft.downPayment) > 0 && ` with ${formatMoney(draft.downPayment)} down`}
          </p>
          <p className="text-black/70">
            About {formatMoney(finance.daily, 2)} per working day, or {formatMoney(finance.hourly, 2)} per hour.
          </p>
          {otherRates
            .filter((r) => r.monthly > 0)
            .map((r) => (
              <p key={`${r.ratePercent}-${r.months}`} className="text-black/70">
                Or {formatMoney(r.monthly, 2)}/month — {formatRate(r.ratePercent, r.months)}
              </p>
            ))}
        </div>
      )}

      <p className="text-xs text-black/60">Prices are subject to change and availability.</p>
    </div>
  );
}
