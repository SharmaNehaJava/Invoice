import { useRef, useState } from "react";
import { Copy, Plus, RotateCcw } from "lucide-react";
import { Badge, Button, Card, CardHeader } from "../components/ui";
import CatalogSearch from "../components/quote/CatalogSearch";
import LineItems from "../components/quote/LineItems";
import MarginControl from "../components/quote/MarginControl";
import FinanceSection from "../components/quote/FinanceSection";
import QuoteSummary from "../components/quote/QuoteSummary";
import { YARD_STOCK } from "../data/catalogData";
import {
  costSheetText,
  customerQuoteText,
  financeQuote,
  formatMoney,
  priceQuote,
  quoteLabel,
} from "../lib/pricing";
import { activeFinance, addItem, addLine, customLine, newDraft } from "../lib/quoteDraft";
import { canShare, copyText, shareText } from "../lib/clipboard";

export default function QuotePage({
  draft,
  setDraft,
  customers,
  repName,
  onSaveQuote,
  notify,
  commissionPct,
  onCommissionChange,
}) {
  const customerRef = useRef(null);
  const [customerError, setCustomerError] = useState("");

  const update = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const pricing = priceQuote(draft);
  const { programName, rate } = activeFinance(draft);
  const finance = financeQuote({
    sellPrice: pricing.sellPrice,
    downPayment: draft.downPayment,
    tradeIn: draft.tradeIn,
    ratePercent: rate.ratePercent,
    months: rate.months,
  });

  const hasLines = draft.lines.length > 0;
  const models = new Set(draft.lines.map((l) => l.model));
  const stock = YARD_STOCK.filter((s) => models.has(s.model));
  const inQuote = draft.lines.reduce((acc, l) => {
    if (l.itemId) acc[l.itemId] = (acc[l.itemId] ?? 0) + Number(l.qty || 0);
    return acc;
  }, {});

  const textArgs = {
    draft,
    pricing,
    finance,
    rate,
    programName,
    customer: draft.customer,
    tradeIn: draft.tradeIn,
    itemize: draft.itemize,
  };

  const requireQuote = () => {
    if (!hasLines) {
      notify("Add at least one item first", "error");
      return false;
    }
    return true;
  };

  const requireCustomer = () => {
    if (draft.customer.trim()) return true;
    setCustomerError("Add a customer to save this quote.");
    customerRef.current?.focus();
    return false;
  };

  const save = (status) => {
    const id = onSaveQuote(draft, { status, machine: quoteLabel(draft.lines), sellPrice: pricing.sellPrice });
    update({ quoteId: id });
  };

  const handleCopyCustomer = async () => {
    if (!requireQuote()) return;
    const ok = await copyText(customerQuoteText({ ...textArgs, repName }));
    notify(ok ? "Customer quote copied — paste it into your text" : "Couldn't copy. Select the text manually.", ok ? "success" : "error");
  };

  const handleShareCustomer = () => {
    if (requireQuote()) shareText(customerQuoteText({ ...textArgs, repName }), "CC Equipment quote");
  };

  const handleSendToSheldon = async () => {
    if (!requireQuote() || !requireCustomer()) return;
    const ok = await copyText(costSheetText(textArgs));
    save("review");
    notify(ok ? "Cost sheet copied and saved as With Sheldon" : "Saved as With Sheldon. Copy failed — try again.", ok ? "success" : "error");
  };

  const handleSave = () => {
    if (!requireQuote() || !requireCustomer()) return;
    save("draft");
    notify(`Quote saved to ${draft.customer}`, "success");
  };

  const mailtoHref = `mailto:?subject=${encodeURIComponent(
    `Cost sheet for review — ${draft.customer || quoteLabel(draft.lines)}`
  )}&body=${encodeURIComponent(costSheetText(textArgs))}`;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      {/* Builder */}
      <div className="min-w-0 space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_260px]">
          <CatalogSearch inQuote={inQuote} onAdd={(item) => setDraft((d) => addItem(d, item))} />
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
              className={`h-11 w-full rounded-lg border bg-panel px-3 text-sm text-text-main placeholder:text-text-dim focus:border-accent focus:outline-none ${
                customerError ? "border-error" : "border-line-strong"
              }`}
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
          <CardHeader
            title={
              <span className="flex flex-wrap items-center gap-2">
                Items
                {hasLines && <Badge>{draft.lines.length}</Badge>}
                {draft.quoteId && <Badge tone="info">Editing {draft.quoteId}</Badge>}
              </span>
            }
            action={
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setDraft((d) => addLine(d, customLine()))}>
                  <Plus size={14} aria-hidden="true" />
                  Custom item
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDraft(newDraft());
                    setCustomerError("");
                  }}
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  New quote
                </Button>
              </div>
            }
          />
          <LineItems draft={draft} pricing={pricing} setDraft={setDraft} />
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader title="Margin" subtitle="On sell price: cost ÷ (1 − margin)" />
            <div className="p-4">
              <MarginControl
                value={draft.marginPct}
                onChange={(v) => update({ marginPct: v })}
                totalCost={pricing.totalCost}
                sellPrice={pricing.sellPrice}
              />
            </div>
          </Card>

          <Card>
            <CardHeader title="Finance" />
            <div className="p-4">
              <FinanceSection draft={draft} update={update} />
            </div>
          </Card>
        </div>

        {hasLines && (
          <Card>
            <CardHeader
              title="On the ground"
              subtitle="Yard units matching this quote"
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
        )}
      </div>

      {/* Summary */}
      <aside className="xl:sticky xl:top-18 xl:self-start">
        <QuoteSummary
          draft={draft}
          update={update}
          pricing={pricing}
          finance={finance}
          rate={rate}
          programName={programName}
          canShare={canShare()}
          mailtoHref={mailtoHref}
          onCopyCustomer={handleCopyCustomer}
          onShareCustomer={handleShareCustomer}
          onSendToSheldon={handleSendToSheldon}
          onSave={handleSave}
          commissionPct={commissionPct}
          onCommissionChange={onCommissionChange}
        />
      </aside>

      {/* Phone and small laptop: keep the number and the main action in reach */}
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
