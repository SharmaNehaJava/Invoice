import { useState } from "react";
import { CalendarDays, Link, Plus, Search, Star } from "lucide-react";
import { Badge, Button, Card, CardHeader, EmptyState, Field, PageHeader, inputClass } from "../components/ui";
import { QuoteRow } from "./QuotesPage";
import { copyText } from "../lib/clipboard";

const FEEDBACK_LINK = "https://ccequipment.ca/feedback/demo-session-current";

function AddCustomerForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({ name: "", contact: "", phone: "", email: "" });
  const [error, setError] = useState("");
  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setError("");
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Enter the company name.");
      return;
    }
    onAdd({ ...form, name: form.name.trim() });
  };

  return (
    <form onSubmit={submit} className="space-y-3 border-b border-line p-4">
      <Field label="Company" htmlFor="new-name">
        <input id="new-name" value={form.name} onChange={set("name")} className={inputClass} placeholder="RG Excavating" autoFocus />
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Contact" htmlFor="new-contact">
          <input id="new-contact" value={form.contact} onChange={set("contact")} className={inputClass} placeholder="Jeff" />
        </Field>
        <Field label="Phone" htmlFor="new-phone">
          <input id="new-phone" type="tel" value={form.phone} onChange={set("phone")} className={inputClass} placeholder="250 555 0100" />
        </Field>
      </div>
      <Field label="Email" htmlFor="new-email">
        <input id="new-email" type="email" value={form.email} onChange={set("email")} className={inputClass} placeholder="jeff@rgexcavating.ca" />
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          Add customer
        </Button>
      </div>
    </form>
  );
}

export default function CustomersPage({ customers, quotes, events, feedback, onAddCustomer, onOpenQuote, onQuoteFor, notify }) {
  const [term, setTerm] = useState("");
  const [selectedId, setSelectedId] = useState(customers[0]?.id ?? null);
  const [adding, setAdding] = useState(false);

  const visible = customers.filter((c) =>
    `${c.name} ${c.contact}`.toLowerCase().includes(term.trim().toLowerCase())
  );
  const selected = customers.find((c) => c.id === selectedId) ?? visible[0];

  const byCustomer = (list) => list.filter((x) => x.customer === selected?.name);
  const theirQuotes = selected ? byCustomer(quotes) : [];
  const theirEvents = selected ? byCustomer(events) : [];
  const theirFeedback = selected ? byCustomer(feedback) : [];

  const copyFeedbackLink = async () => {
    const ok = await copyText(FEEDBACK_LINK);
    notify(ok ? "Feedback link copied" : "Couldn't copy the link", ok ? "success" : "error");
  };

  return (
    <div>
      <PageHeader
        description="Everyone you've quoted, with their quotes, visits and demo feedback."
        action={
          <Button onClick={copyFeedbackLink}>
            <Link size={15} aria-hidden="true" />
            Copy feedback link
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="self-start">
          <div className="flex items-center gap-2 border-b border-line p-3">
            <div className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-line-strong px-2.5 focus-within:border-accent">
              <Search size={15} className="text-text-dim" aria-hidden="true" />
              <label htmlFor="customer-search" className="sr-only">
                Search customers
              </label>
              <input
                id="customer-search"
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
            <Button size="sm" aria-label="Add customer" onClick={() => setAdding(true)} className="h-9 w-9 px-0">
              <Plus size={16} />
            </Button>
          </div>

          {adding && (
            <AddCustomerForm
              onCancel={() => setAdding(false)}
              onAdd={(c) => {
                const id = onAddCustomer(c);
                setSelectedId(id);
                setAdding(false);
              }}
            />
          )}

          <ul className="max-h-[60vh] overflow-y-auto p-1.5">
            {visible.map((c) => {
              const count = quotes.filter((q) => q.customer === c.name).length;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left ${
                      selected?.id === c.id ? "bg-accent-subtle" : "hover:bg-panel-hover"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-text-main">{c.name}</span>
                      {c.contact && <span className="block text-xs text-text-dim">{c.contact}</span>}
                    </span>
                    {count > 0 && <Badge>{count}</Badge>}
                  </button>
                </li>
              );
            })}
            {visible.length === 0 && <li className="px-3 py-4 text-sm text-text-dim">No customers match.</li>}
          </ul>
        </Card>

        {selected ? (
          <div className="min-w-0 space-y-4">
            <Card>
              <div className="flex flex-wrap items-center gap-4 p-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-accent-subtle text-lg font-semibold text-accent-text">
                  {selected.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-text-main">{selected.name}</h2>
                  <p className="text-sm text-text-muted">
                    {[selected.contact, selected.phone, selected.email].filter(Boolean).join(" · ") || "No contact details yet"}
                  </p>
                </div>
                <Button variant="primary" onClick={() => onQuoteFor(selected.name)}>
                  New quote
                </Button>
              </div>
            </Card>

            <Card>
              <CardHeader title="Quotes" subtitle={`${theirQuotes.length} saved`} />
              {theirQuotes.length ? (
                <ul className="divide-y divide-line">
                  {theirQuotes.map((q) => (
                    <QuoteRow key={q.id} quote={q} onOpen={onOpenQuote} />
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-3 text-sm text-text-dim">No quotes yet.</p>
              )}
            </Card>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardHeader title="Visits and follow-ups" />
                {theirEvents.length ? (
                  <ul className="divide-y divide-line">
                    {theirEvents.map((ev) => (
                      <li key={ev.id} className="flex items-start gap-3 px-4 py-2.5">
                        <CalendarDays size={16} className="mt-0.5 text-text-dim" aria-hidden="true" />
                        <div>
                          <p className="text-sm text-text-main">{ev.title}</p>
                          <p className="font-data text-xs text-text-dim">{ev.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-4 py-3 text-sm text-text-dim">Nothing scheduled.</p>
                )}
              </Card>

              <Card>
                <CardHeader title="Demo feedback" />
                {theirFeedback.length ? (
                  <ul className="divide-y divide-line">
                    {theirFeedback.map((fb) => (
                      <li key={fb.id} className="space-y-1 px-4 py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-text-main">{fb.machine}</span>
                          <span className="flex items-center gap-1 text-xs text-text-muted" aria-label={`${fb.rating} out of 5`}>
                            <Star size={13} aria-hidden="true" /> {fb.rating}/5
                          </span>
                        </div>
                        <p className="text-sm text-text-muted">“{fb.comment}”</p>
                        <p className="text-xs text-text-dim">{fb.date}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-4 py-3 text-sm text-text-dim">No feedback yet. Send them the feedback link after a demo.</p>
                )}
              </Card>
            </div>
          </div>
        ) : (
          <EmptyState title="Add your first customer" body="Customers you quote are added here automatically." />
        )}
      </div>
    </div>
  );
}
