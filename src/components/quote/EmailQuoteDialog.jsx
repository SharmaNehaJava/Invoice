import { useState } from "react";
import { Info, Send } from "lucide-react";
import Dialog from "../Dialog";
import { Button, Field, inputClass } from "../ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Recipient({ id, label, checked, onToggle, children }) {
  return (
    <section className={`rounded-xl border ${checked ? "border-line-strong" : "border-line"} p-3`}>
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold text-text-main">
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} className="size-4 accent-[var(--accent)]" />
        {label}
      </label>
      {checked && <div className="mt-3 space-y-3">{children}</div>}
    </section>
  );
}

function AddressField({ id, value, onChange, error, savedValue, saveLabel, save, onSaveChange }) {
  const changed = value.trim() && value.trim() !== (savedValue || "") && EMAIL_RE.test(value.trim());
  return (
    <Field label="To" htmlFor={id}>
      <input
        id={id}
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="name@company.com"
        aria-invalid={Boolean(error)}
        className={`${inputClass} ${error ? "border-error" : ""}`}
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
      {changed && (
        <label className="mt-1.5 flex items-center gap-2 text-xs text-text-muted">
          <input type="checkbox" checked={save} onChange={(e) => onSaveChange(e.target.checked)} className="accent-[var(--accent)]" />
          {saveLabel}
        </label>
      )}
    </Field>
  );
}

export default function EmailQuoteDialog({
  initialAudience,
  customer,
  customerName,
  manager,
  emailLive,
  defaults,
  onSend,
  onClose,
}) {
  const [toCustomer, setToCustomer] = useState(initialAudience === "customer");
  const [toManager, setToManager] = useState(initialAudience === "manager");
  const [form, setForm] = useState({
    customerEmail: customer?.email ?? "",
    customerSubject: defaults.customerSubject,
    customerMessage: defaults.customerMessage,
    saveCustomerEmail: true,
    managerEmail: manager.email ?? "",
    managerSubject: defaults.managerSubject,
    managerMessage: defaults.managerMessage,
    saveManagerEmail: true,
    attachPdf: true,
    followUp: true,
    followUpDays: 3,
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setSendError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!toCustomer && !toManager) next.audience = "Choose who to send it to.";
    if (toCustomer && !EMAIL_RE.test(form.customerEmail.trim())) next.customerEmail = "Enter the customer's email address.";
    if (toManager && !EMAIL_RE.test(form.managerEmail.trim())) next.managerEmail = "Enter the sales manager's email address.";
    if (toCustomer && !form.customerSubject.trim()) next.customerSubject = "Add a subject.";
    if (toManager && !form.managerSubject.trim()) next.managerSubject = "Add a subject.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSending(true);
    try {
      await onSend({
        customer: toCustomer
          ? {
              to: form.customerEmail.trim(),
              subject: form.customerSubject.trim(),
              message: form.customerMessage,
              saveAddress: form.saveCustomerEmail && form.customerEmail.trim() !== (customer?.email ?? ""),
            }
          : null,
        manager: toManager
          ? {
              to: form.managerEmail.trim(),
              subject: form.managerSubject.trim(),
              message: form.managerMessage,
              saveAddress: form.saveManagerEmail && form.managerEmail.trim() !== (manager.email ?? ""),
            }
          : null,
        attachPdf: form.attachPdf,
        followUpDays: toCustomer && form.followUp ? Number(form.followUpDays) || 3 : null,
      });
    } catch (error) {
      setSendError(error.message);
      setSending(false);
    }
  };

  return (
    <Dialog title="Email quote" onClose={sending ? () => {} : onClose} wide>
      <form onSubmit={submit} noValidate className="space-y-3 p-4">
        {emailLive === false && (
          <p className="flex gap-2 rounded-lg border border-warning/30 bg-warning-subtle p-3 text-xs text-warning">
            <Info size={16} className="shrink-0" aria-hidden="true" />
            Demo mode: emails aren't really sent and tracking is simulated. Add an email API key on the server to send for
            real.
          </p>
        )}

        <Recipient id="send-customer" label={`Customer — ${customerName}`} checked={toCustomer} onToggle={setToCustomer}>
          <AddressField
            id="customer-to"
            value={form.customerEmail}
            onChange={set("customerEmail")}
            error={errors.customerEmail}
            savedValue={customer?.email}
            saveLabel={customer?.email ? "Replace the email saved for this customer" : "Save this email to the customer"}
            save={form.saveCustomerEmail}
            onSaveChange={set("saveCustomerEmail")}
          />
          <Field label="Subject" htmlFor="customer-subject">
            <input id="customer-subject" value={form.customerSubject} onChange={(e) => set("customerSubject")(e.target.value)} className={inputClass} />
            {errors.customerSubject && <p className="mt-1 text-xs text-error">{errors.customerSubject}</p>}
          </Field>
          <Field label="Message" htmlFor="customer-message">
            <textarea
              id="customer-message"
              rows={8}
              value={form.customerMessage}
              onChange={(e) => set("customerMessage")(e.target.value)}
              className={`${inputClass} h-auto py-2`}
            />
          </Field>
          <label className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
            <input type="checkbox" checked={form.followUp} onChange={(e) => set("followUp")(e.target.checked)} className="size-4 accent-[var(--accent)]" />
            Remind me to follow up in
            <input
              type="number"
              min="1"
              aria-label="Days until follow-up"
              value={form.followUpDays}
              onChange={(e) => set("followUpDays")(e.target.value)}
              className="h-8 w-16 rounded-lg border border-line-strong bg-panel px-2 text-center text-sm text-text-main"
            />
            days
          </label>
        </Recipient>

        <Recipient id="send-manager" label={`${manager.label} — cost sheet for approval`} checked={toManager} onToggle={setToManager}>
          <AddressField
            id="manager-to"
            value={form.managerEmail}
            onChange={set("managerEmail")}
            error={errors.managerEmail}
            savedValue={manager.email}
            saveLabel="Save as the sales manager's email in Settings"
            save={form.saveManagerEmail}
            onSaveChange={set("saveManagerEmail")}
          />
          <Field label="Subject" htmlFor="manager-subject">
            <input id="manager-subject" value={form.managerSubject} onChange={(e) => set("managerSubject")(e.target.value)} className={inputClass} />
            {errors.managerSubject && <p className="mt-1 text-xs text-error">{errors.managerSubject}</p>}
          </Field>
          <Field label="Note (the full cost sheet is added below it)" htmlFor="manager-message">
            <textarea
              id="manager-message"
              rows={3}
              value={form.managerMessage}
              onChange={(e) => set("managerMessage")(e.target.value)}
              className={`${inputClass} h-auto py-2`}
            />
          </Field>
        </Recipient>

        {errors.audience && <p className="text-sm text-error">{errors.audience}</p>}

        <label className="flex items-center gap-2 text-sm text-text-muted">
          <input type="checkbox" checked={form.attachPdf} onChange={(e) => set("attachPdf")(e.target.checked)} className="size-4 accent-[var(--accent)]" />
          Attach the quote PDF
        </label>

        {sendError && <p className="rounded-lg bg-error-subtle p-3 text-sm text-error">{sendError}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={sending} className="min-w-28 disabled:opacity-60">
            <Send size={15} aria-hidden="true" />
            {sending ? "Sending…" : toCustomer && toManager ? "Send both" : "Send"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
