import { useState } from "react";
import { Check, MailWarning } from "lucide-react";
import { Badge, Button, Card, CardHeader, Segmented } from "./ui";
import { daysFromToday, describeDue, formatTimestamp, toISODate } from "../lib/dates";
import { EmailStatusBadge } from "./EmailHistory";

const UNOPENED_AFTER_DAYS = 2;

const RANGES = [
  { value: 0, label: "Today" },
  { value: 14, label: "Next 14 days" },
];

// Open follow-ups from the call log. Overdue ones always show.
export default function FollowUps({ activities, emails = [], onToggleDone, onOpenCustomer }) {
  const [range, setRange] = useState(14);

  const due = activities
    .filter((a) => a.followUp && !a.done && daysFromToday(a.followUp) <= range)
    .sort((a, b) => a.followUp.localeCompare(b.followUp));

  // Quotes emailed a while ago that the customer still hasn't opened.
  const unopened = emails.filter(
    (e) =>
      e.kind === "customer" &&
      ["sent", "delivered"].includes(e.status) &&
      daysFromToday(toISODate(new Date(e.sentAt))) <= -UNOPENED_AFTER_DAYS
  );

  return (
    <Card className="mb-4">
      <CardHeader
        title="Follow-ups"
        subtitle="From the call log on each customer"
        action={<Segmented options={RANGES} value={range} onChange={setRange} />}
      />
      {unopened.length > 0 && (
        <ul className="divide-y divide-line border-b border-line bg-warning-subtle/40">
          {unopened.map((e) => (
            <li key={e.id} className="flex items-start gap-3 px-4 py-3">
              <MailWarning size={16} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <button type="button" onClick={() => onOpenCustomer(e.customer)} className="text-sm font-medium text-text-main hover:underline">
                  {e.customer}
                </button>
                <p className="text-sm text-text-muted">
                  Quote {e.quoteId} emailed {formatTimestamp(e.sentAt)} hasn't been opened — give them a call
                </p>
              </div>
              <EmailStatusBadge email={e} />
            </li>
          ))}
        </ul>
      )}
      {due.length ? (
        <ul className="divide-y divide-line">
          {due.map((a) => {
            const status = describeDue(a.followUp);
            return (
              <li key={a.id} className="flex items-start gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenCustomer(a.customer)}
                      className="text-sm font-medium text-text-main hover:underline"
                    >
                      {a.customer}
                    </button>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                  <p className="line-clamp-2 text-sm text-text-muted">{a.note}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onToggleDone(a.id)}>
                  <Check size={14} aria-hidden="true" />
                  Done
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-4 py-3 text-sm text-text-dim">
          {range === 0 ? "Nothing due today." : "No follow-ups in the next fortnight."}
        </p>
      )}
    </Card>
  );
}
