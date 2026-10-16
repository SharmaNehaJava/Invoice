import { Mail } from "lucide-react";
import { Badge, Card, CardHeader } from "./ui";
import { EMAIL_STATUSES } from "../lib/emailApi";
import { formatTimestamp } from "../lib/dates";

export function EmailStatusBadge({ email }) {
  const status = EMAIL_STATUSES[email.status] ?? EMAIL_STATUSES.sent;
  const lastChange = email.history?.[email.history.length - 1]?.at;
  return (
    <Badge tone={status.tone} className="gap-1" title={lastChange ? `${status.label} ${formatTimestamp(lastChange)}` : undefined}>
      {status.label}
      {email.demo && <span className="opacity-70">(demo)</span>}
    </Badge>
  );
}

// Emails sent from the app for one customer, newest first, with tracking.
export default function EmailHistory({ emails }) {
  const sorted = [...emails].sort((a, b) => b.sentAt.localeCompare(a.sentAt));

  return (
    <Card>
      <CardHeader title="Emails" subtitle="Sent from the app, with delivery and open tracking" />
      {sorted.length ? (
        <ul className="divide-y divide-line">
          {sorted.map((email) => (
            <li key={email.id} className="flex items-start gap-3 px-4 py-3">
              <Mail size={16} className="mt-0.5 shrink-0 text-text-dim" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-main">{email.subject}</p>
                <p className="text-xs text-text-dim">
                  {email.kind === "manager" ? "For approval · " : ""}
                  {email.to} · {formatTimestamp(email.sentAt)}
                </p>
                {email.history?.length > 1 && (
                  <p className="mt-0.5 text-xs text-text-dim">
                    {email.history
                      .map((h) => `${EMAIL_STATUSES[h.status]?.label ?? h.status} ${formatTimestamp(h.at)}`)
                      .join(" → ")}
                  </p>
                )}
              </div>
              <EmailStatusBadge email={email} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-3 text-sm text-text-dim">No emails sent to this customer yet.</p>
      )}
    </Card>
  );
}
