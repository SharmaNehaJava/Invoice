import { useState } from "react";
import { Check } from "lucide-react";
import { Badge, Button, Card, CardHeader, Segmented } from "./ui";
import { daysFromToday, describeDue } from "../lib/dates";

const RANGES = [
  { value: 0, label: "Today" },
  { value: 14, label: "Next 14 days" },
];

// Open follow-ups from the call log. Overdue ones always show.
export default function FollowUps({ activities, onToggleDone, onOpenCustomer }) {
  const [range, setRange] = useState(14);

  const due = activities
    .filter((a) => a.followUp && !a.done && daysFromToday(a.followUp) <= range)
    .sort((a, b) => a.followUp.localeCompare(b.followUp));

  return (
    <Card className="mb-4">
      <CardHeader
        title="Follow-ups"
        subtitle="From the call log on each customer"
        action={<Segmented options={RANGES} value={range} onChange={setRange} />}
      />
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
