import { useState } from "react";
import { FolderOpen, Trash2 } from "lucide-react";
import { Badge, Button, Card, EmptyState, PageHeader, Segmented } from "../components/ui";
import { QUOTE_STATUSES } from "../data/mockRecords";
import { formatMoney } from "../lib/pricing";
import { formatTimestamp } from "../lib/dates";


export function QuoteRow({ quote, onOpen, onStatusChange, onDelete }) {
  const status = QUOTE_STATUSES[quote.status] ?? QUOTE_STATUSES.draft;
  return (
    <li className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-text-main">{quote.customer}</span>
          <Badge tone={status.tone}>{status.label}</Badge>
          <span className="font-data text-xs text-text-dim">{quote.id}</span>
        </div>
        <p className="truncate text-sm text-text-muted">{quote.machine}</p>
        {quote.note && <p className="mt-0.5 text-xs text-text-dim">{quote.note}</p>}
      </div>
      <div className="flex items-center gap-3 sm:justify-end">
        <div className="mr-auto text-left sm:mr-0 sm:text-right">
          <div className="font-data font-semibold text-text-main">{formatMoney(quote.sellPrice)}</div>
          <div className="text-xs text-text-dim">{formatTimestamp(quote.createdAt)}</div>
        </div>
        {onStatusChange && (
          <>
            <label htmlFor={`status-${quote.id}`} className="sr-only">
              Status for {quote.id}
            </label>
            <select
              id={`status-${quote.id}`}
              value={quote.status}
              onChange={(e) => onStatusChange(quote.id, e.target.value)}
              className="h-8 rounded-lg border border-line-strong bg-panel px-2 text-xs text-text-main"
            >
              {Object.entries(QUOTE_STATUSES).map(([value, s]) => (
                <option key={value} value={value}>
                  {s.label}
                </option>
              ))}
            </select>
          </>
        )}
        <Button
          size="sm"
          onClick={() => onOpen(quote)}
          disabled={!quote.draft}
          title={quote.draft ? "Open on the quote desk" : "Created before the quote desk; can't be reopened"}
          className="disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FolderOpen size={14} aria-hidden="true" />
          Open
        </Button>
        {onDelete && (
          <Button variant="danger" size="sm" aria-label={`Delete ${quote.id}`} onClick={() => onDelete(quote.id)} className="w-8 px-0">
            <Trash2 size={14} />
          </Button>
        )}
      </div>
    </li>
  );
}

export default function QuotesPage({ quotes, onOpen, onStatusChange, onDelete, onNewQuote }) {
  const [filter, setFilter] = useState("all");

  const counts = Object.fromEntries(
    Object.keys(QUOTE_STATUSES).map((k) => [k, quotes.filter((q) => q.status === k).length])
  );
  const options = [
    { value: "all", label: `All ${quotes.length}` },
    ...Object.entries(QUOTE_STATUSES).map(([value, s]) => ({ value, label: `${s.label} ${counts[value]}` })),
  ];
  const visible = filter === "all" ? quotes : quotes.filter((q) => q.status === filter);

  return (
    <div>
      <PageHeader
        description="Every saved quote. Mark Sheldon's approval here once he's signed off."
        action={
          <Button variant="primary" onClick={onNewQuote}>
            New quote
          </Button>
        }
      />
      <div className="mb-3 overflow-x-auto">
        <Segmented options={options} value={filter} onChange={setFilter} />
      </div>

      {visible.length ? (
        <Card>
          <ul className="divide-y divide-line">
            {visible.map((q) => (
              <QuoteRow
                key={q.id}
                quote={q}
                onOpen={onOpen}
                onStatusChange={onStatusChange}
                onDelete={(id) => {
                  if (window.confirm(`Delete quote ${id}? This can't be undone.`)) onDelete(id);
                }}
              />
            ))}
          </ul>
        </Card>
      ) : (
        <EmptyState title="No quotes here" body="Quotes you save or send to Sheldon show up in this list." />
      )}
    </div>
  );
}
