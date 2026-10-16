import { useRef, useState } from "react";
import { Copy, Pencil, Plus, RotateCcw, UserPlus } from "lucide-react";
import { Badge, Button, Card, CardHeader } from "../components/ui";
import CatalogSearch from "../components/quote/CatalogSearch";
import LineItems from "../components/quote/LineItems";
import MarginControl from "../components/quote/MarginControl";
import FinanceSection from "../components/quote/FinanceSection";
import QuoteSummary from "../components/quote/QuoteSummary";
import OwnVsRent from "../components/quote/OwnVsRent";
import CustomerForm from "../components/CustomerForm";
import Dialog from "../components/Dialog";
import { CUSTOM_PROGRAM_ID, FINANCE_PROGRAMS, YARD_STOCK } from "../data/catalogData";
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
  settings,
  onAddCustomer,
  onUpdateCustomer,
}) {
  const customerRef = useRef(null);
  const [customerError, setCustomerError] = useState("");
  const [customerDialog, setCustomerDialog] = useState(null);

  const typedName = draft.customer.trim();
  const customer = customers.find((c) => c.name.toLowerCase() === typedName.toLowerCase());

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

  // The bulletin's other terms, for quoting the customer every option.
  const program = FINANCE_PROGRAMS.find((p) => p.id === draft.programId);
  const hasOtherRates = draft.programId !== CUSTOM_PROGRAM_ID && (program?.rates.length ?? 0) > 1;
  const otherRates =
    hasOtherRates && draft.showAllRates
      ? program.rates
          .filter((_, idx) => idx !== draft.rateIndex)
          .map((r) => ({
            ...r,
            monthly: financeQuote({
              sellPrice: pricing.sellPrice,
              downPayment: draft.downPayment,
              tradeIn: draft.tradeIn,
              ratePercent: r.ratePercent,
              months: r.months,
            }).monthly,
          }))
      : [];

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
    otherRates,
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
    return id;
  };

  const handleCopyCustomer = async () => {
    if (!requireQuote()) return;
    const ok = await copyText(customerQuoteText({ ...textArgs, repName }));
    notify(ok ? "Customer quote copied — paste it into your text" : "Couldn't copy. Select the text manually.", ok ? "success" : "error");
  };

  const handleShareCustomer = () => {
    if (requireQuote()) shareText(customerQuoteText({ ...textArgs, repName }), "CC Equipment quote");
  };

  const handleSendForApproval = async () => {
    if (!requireQuote() || !requireCustomer()) return;
    const ok = await copyText(costSheetText(textArgs));
    save("review");
    notify(ok ? "Cost sheet copied and saved as awaiting approval" : "Saved as awaiting approval. Copy failed — try again.", ok ? "success" : "error");
  };

  const handleSave = () => {
    if (!requireQuote() || !requireCustomer()) return;
    save("draft");
    notify(`Quote saved to ${draft.customer}`, "success");
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(customerQuoteText({ ...textArgs, repName }))}`;

  // Saving first gives the PDF a real quote number.
  const handleDownloadPdf = async () => {
    if (!requireQuote() || !requireCustomer()) return;
    // Loaded on demand: the PDF library is large and most visits don't need it.
    const { buildQuotePdf, quoteFileName } = await import("../lib/quotePdf");
    const quoteId = save();
    const pdfDraft = { ...draft, quoteId };
    const doc = buildQuotePdf({
      draft: pdfDraft,
      pricing,
      finance,
      rate,
      programName,
      otherRates,
      settings,
      customer: customer ?? { name: typedName },
    });
    doc.save(quoteFileName(pdfDraft, typedName));
    notify(`PDF downloaded for ${quoteId}`);
  };

  const mailtoHref = `mailto:?subject=${encodeURIComponent(
    `Cost sheet for review — ${draft.customer || quoteLabel(draft.lines)}`
  )}&body=${encodeURIComponent(costSheetText(textArgs))}`;

  return (
    <>
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
              {customer && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-text-dim">
                  <span className="truncate">
                    {[customer.contact, customer.email || "no email yet"].filter(Boolean).join(" · ")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCustomerDialog("edit")}
                    className="inline-flex shrink-0 items-center gap-1 text-info hover:underline"
                  >
                    <Pencil size={11} aria-hidden="true" />
                    Edit
                  </button>
                </p>
              )}
              {!customer && typedName && (
                <button
                  type="button"
                  onClick={() => setCustomerDialog("add")}
                  className="mt-1 inline-flex items-center gap-1 text-xs text-info hover:underline"
                >
                  <UserPlus size={12} aria-hidden="true" />
                  New customer — add their details
                </button>
              )}
            </div>
          </div>

          <Card>
            <CardHeader
              title={
                <span className="flex flex-wrap items-center gap-2">
                  Items
                  {hasLines && <Badge>{draft.lines.length}</Badge>}
                <Badge tone="warning">Sample prices</Badge>
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

          {hasLines && <OwnVsRent draft={draft} update={update} finance={finance} rate={rate} notify={notify} />}

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
            onSendForApproval={handleSendForApproval}
            onSave={handleSave}
            hasOtherRates={hasOtherRates}
            whatsappHref={whatsappHref}
            onDownloadPdf={handleDownloadPdf}
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

      {customerDialog && (
        <Dialog
          title={customerDialog === "add" ? "Add customer" : `Edit ${customer?.name}`}
          onClose={() => setCustomerDialog(null)}
        >
          <CustomerForm
            initial={customerDialog === "edit" ? customer : { name: typedName }}
            existingNames={customers.map((c) => c.name)}
            submitLabel={customerDialog === "add" ? "Add customer" : "Save changes"}
            onCancel={() => setCustomerDialog(null)}
            onSubmit={(data) => {
              if (customerDialog === "add") onAddCustomer(data);
              else onUpdateCustomer(customer.id, data);
              update({ customer: data.name });
              setCustomerDialog(null);
              notify(customerDialog === "add" ? `${data.name} added` : "Customer details saved");
            }}
          />
        </Dialog>
      )}
    </>
  );
}
