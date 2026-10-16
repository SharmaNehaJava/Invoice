import { useState } from "react";
import { Check, FileText, Trash2 } from "lucide-react";
import { Badge, Button, Card, CardHeader, Field, inputClass } from "./ui";
import { addDays, describeDue, formatTimestamp, todayISO } from "../lib/dates";

const QUICK_DATES = [
  { label: "Tomorrow", days: 1 },
  { label: "1 week", days: 7 },
  { label: "2 weeks", days: 14 },
];

function LogForm({ customer, quotes, onLog }) {
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [quoteId, setQuoteId] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!note.trim()) {
      setError("Write a quick note about the call first.");
      return;
    }
    onLog({ note: note.trim(), followUp, quoteId: quoteId || null });
    setNote("");
    setFollowUp("");
    setQuoteId("");
  };

  return (
    <form onSubmit={submit} className="space-y-3 border-b border-line p-4">
      <Field label={`What happened with ${customer}?`} htmlFor="call-note">
        <textarea
          id="call-note"
          rows={3}
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setError("");
          }}
          placeholder="Jeff wants 48-month lease rates on the DW30. Call back after he talks to his partner."
          className={`${inputClass} h-auto py-2`}
        />
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Follow up on" htmlFor="follow-up">
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              id="follow-up"
              type="date"
              value={followUp}
              min={todayISO()}
              onChange={(e) => setFollowUp(e.target.value)}
              className={`${inputClass} w-40`}
            />
            {QUICK_DATES.map((q) => (
              <Button key={q.days} size="sm" onClick={() => setFollowUp(addDays(todayISO(), q.days))}>
                {q.label}
              </Button>
            ))}
          </div>
        </Field>
        <Field label="Attach a quote" htmlFor="attach-quote">
          <select id="attach-quote" value={quoteId} onChange={(e) => setQuoteId(e.target.value)} className={inputClass}>
            <option value="">No quote</option>
            {quotes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.id} — {q.machine}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex justify-end">
        <Button variant="primary" type="submit">
          Log call
        </Button>
      </div>
    </form>
  );
}

export default function CallLog({ customer, activities, quotes, onLog, onToggleDone, onDelete, onOpenQuote }) {
  const sorted = [...activities].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <Card>
      <CardHeader title="Call log" subtitle="Notes before and after every call, with a follow-up date" />
      <LogForm customer={customer} quotes={quotes} onLog={onLog} />
      {sorted.length ? (
        <ul className="divide-y divide-line">
          {sorted.map((a) => {
            const quote = quotes.find((q) => q.id === a.quoteId);
            const due = a.followUp && !a.done ? describeDue(a.followUp) : null;
            return (
              <li key={a.id} className="flex items-start gap-3 px-4 py-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="whitespace-pre-line text-sm text-text-main">{a.note}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-text-dim">
                    <span>{formatTimestamp(a.createdAt)}</span>
                    {due && <Badge tone={due.tone}>Follow up: {due.label}</Badge>}
                    {a.followUp && a.done && <Badge tone="success">Followed up</Badge>}
                    {quote && (
                      <button
                        type="button"
                        onClick={() => onOpenQuote(quote)}
                        disabled={!quote.draft}
                        className="inline-flex items-center gap-1 text-info hover:underline disabled:text-text-dim disabled:no-underline"
                      >
                        <FileText size={12} aria-hidden="true" />
                        {quote.id}
                      </button>
                    )}
                  </div>
                </div>
                {a.followUp && (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={a.done ? "Mark follow-up as not done" : "Mark follow-up as done"}
                    title={a.done ? "Mark as not done" : "Mark as done"}
                    onClick={() => onToggleDone(a.id)}
                    className={`w-8 px-0 ${a.done ? "text-success" : ""}`}
                  >
                    <Check size={16} />
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  aria-label="Delete note"
                  onClick={() => window.confirm("Delete this note?") && onDelete(a.id)}
                  className="w-8 px-0"
                >
                  <Trash2 size={14} />
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-4 py-3 text-sm text-text-dim">No calls logged yet.</p>
      )}
    </Card>
  );
}
