import { Badge, Card, CardHeader, PageHeader } from "../components/ui";
import { FINANCE_PROGRAMS, WATCH_LIST } from "../data/catalogData";
import { HOURS_PER_DAY, WORKING_DAYS_PER_MONTH, formatRate } from "../lib/pricing";

export default function BulletinsPage() {
  return (
    <div className="space-y-4">
      <PageHeader description="Finance programmes, pricing method and things to watch." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {FINANCE_PROGRAMS.map((p) => (
          <Card key={p.id}>
            <CardHeader
              title={p.name}
              subtitle={`Valid to ${p.validTo} · ${p.brands.join(", ")}`}
              action={<Badge tone="success">Active</Badge>}
            />
            <div className="space-y-3 p-4">
              <div className="flex flex-wrap gap-1.5">
                {p.rates.map((r, i) => (
                  <Badge key={i} tone="accent" className="font-data text-xs">
                    {formatRate(r.ratePercent, r.months)}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-text-muted">{p.summary}</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-text-muted">
                {p.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Pricing method" />
          <dl className="space-y-2 p-4 text-sm">
            {[
              ["Dealer cost", "List price × (1 − less %)"],
              ["Total cost", "Dealer cost + PDI + factory freight"],
              ["Sell price", "Total cost ÷ (1 − margin %)"],
              ["Monthly", "Standard loan payment on sell price − down payment"],
              ["Per day", `Monthly ÷ ${WORKING_DAYS_PER_MONTH} working days`],
              ["Per hour", `Per day ÷ ${HOURS_PER_DAY} hours`],
            ].map(([term, def]) => (
              <div key={term} className="flex flex-wrap justify-between gap-2">
                <dt className="text-text-muted">{term}</dt>
                <dd className="font-data text-text-main">{def}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <CardHeader title="Watch list" subtitle="Lessons paid for once" />
          <ul className="divide-y divide-line">
            {WATCH_LIST.map((w) => (
              <li key={w.title} className="px-4 py-2.5 text-sm">
                <span className="font-medium text-text-main">{w.title}: </span>
                <span className="text-text-muted">{w.text}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
