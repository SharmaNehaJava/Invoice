import { ClipboardCopy, Copy, FileDown, Mail, MessageCircle, Save, Share2, ShieldCheck } from "lucide-react";
import { Button, Card, NumberInput } from "../ui";
import { formatMoney, formatPercent, formatRate, toNumber } from "../../lib/pricing";

function SummaryRow({ label, value, strong }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-text-muted">{label}</span>
      <span className={`font-data text-text-main ${strong ? "font-semibold" : ""}`}>{value}</span>
    </div>
  );
}

export default function QuoteSummary({
  draft,
  update,
  pricing,
  finance,
  rate,
  programName,
  canShare,
  onCopyCustomer,
  onShareCustomer,
  onEmailCustomer,
  onEmailManager,
  onCopyCostSheet,
  onSave,
  commissionPct,
  onCommissionChange,
  hasOtherRates,
  whatsappHref,
  onDownloadPdf,
}) {
  const multiLine = draft.lines.length > 1;

  return (
    <Card>
      <div className="space-y-1 px-4 pb-3 pt-4">
        <p className="text-xs font-medium text-text-muted">Sell price</p>
        <p className="font-data text-3xl font-semibold text-text-main">{formatMoney(pricing.sellPrice, 2)}</p>
        <p className="text-xs text-text-dim">
          {formatPercent(draft.marginPct)} margin · gross profit{" "}
          <span className="font-data text-success">{formatMoney(pricing.grossProfit, 2)}</span>
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5">
        <label htmlFor="commission-rate" className="text-sm text-text-muted">
          Your commission
          <span className="block text-xs text-text-dim">% of gross profit</span>
        </label>
        <div className="flex items-center gap-2">
          <NumberInput
            id="commission-rate"
            value={commissionPct}
            onChange={onCommissionChange}
            suffix="%"
            step="0.5"
            className="h-9 w-20"
          />
          <span className="font-data min-w-20 text-right text-sm font-semibold text-success">
            {commissionPct === "" ? "—" : formatMoney((pricing.grossProfit * toNumber(commissionPct)) / 100, 2)}
          </span>
        </div>
      </div>

      {draft.itemize && multiLine && (
        <ul className="space-y-1 border-t border-line px-4 py-3">
          {pricing.rows.map((row) => (
            <li key={row.line.key} className="flex justify-between gap-3 text-sm">
              <span className="truncate text-text-muted">
                {row.qty !== 1 && `${row.qty} × `}
                {row.line.model || "Custom item"}
              </span>
              <span className="font-data text-text-main">{formatMoney(row.sellPrice, 2)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2 border-t border-line px-4 py-3">
        <p className="text-xs text-text-dim">
          {programName} · {formatRate(rate.ratePercent, rate.months)}
        </p>
        <SummaryRow label="Monthly" value={formatMoney(finance.monthly, 2)} strong />
        <SummaryRow label="Per day (20 working days)" value={formatMoney(finance.daily, 2)} />
        <SummaryRow label="Per hour (8 h day)" value={formatMoney(finance.hourly, 2)} />
      </div>

      <div className="space-y-2 border-t border-line p-4">
        {multiLine && (
          <label className="mb-1 flex items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={draft.itemize}
              onChange={(e) => update({ itemize: e.target.checked })}
              className="size-4 accent-[var(--accent)]"
            />
            Itemize prices (freight shared by cost)
          </label>
        )}
        {hasOtherRates && (
          <label className="mb-1 flex items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={draft.showAllRates}
              onChange={(e) => update({ showAllRates: e.target.checked })}
              className="size-4 accent-[var(--accent)]"
            />
            List every rate in the bulletin
          </label>
        )}
        <div className="flex gap-2">
          <Button variant="primary" size="lg" className="flex-1" onClick={onCopyCustomer}>
            <Copy size={16} aria-hidden="true" />
            Copy for customer
          </Button>
          {canShare && (
            <Button size="lg" aria-label="Share customer quote" onClick={onShareCustomer} className="w-11 px-0">
              <Share2 size={16} />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={onEmailCustomer}>
            <Mail size={16} aria-hidden="true" />
            Email customer
          </Button>
          <Button onClick={onEmailManager}>
            <ShieldCheck size={16} aria-hidden="true" />
            Get approval
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line-strong text-sm font-medium text-text-main hover:bg-panel-hover"
          >
            <MessageCircle size={16} aria-hidden="true" />
            WhatsApp
          </a>
          <Button onClick={onDownloadPdf}>
            <FileDown size={16} aria-hidden="true" />
            Download PDF
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="w-full" onClick={onCopyCostSheet}>
          <ClipboardCopy size={14} aria-hidden="true" />
          Copy cost sheet text
        </Button>
        <Button variant="ghost" size="lg" className="w-full" onClick={onSave}>
          <Save size={16} aria-hidden="true" />
          {draft.quoteId ? `Update ${draft.quoteId}` : "Save to customer"}
        </Button>
      </div>
    </Card>
  );
}
