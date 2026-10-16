import { useState } from "react";
import { Badge, Card, PageHeader, Segmented } from "../components/ui";
import { YARD_STOCK } from "../data/catalogData";

export default function StockPage() {
  const branches = [...new Set(YARD_STOCK.map((s) => s.branch))].sort();
  const [branch, setBranch] = useState("all");
  const visible = branch === "all" ? YARD_STOCK : YARD_STOCK.filter((s) => s.branch === branch);

  return (
    <div>
      <PageHeader description="Physical units on the ground across branches." />
      <div className="mb-3 overflow-x-auto">
        <Segmented
          options={[{ value: "all", label: `All ${YARD_STOCK.length}` }, ...branches.map((b) => ({ value: b, label: b }))]}
          value={branch}
          onChange={setBranch}
        />
      </div>
      <Card>
        <ul className="divide-y divide-line">
          {visible.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="font-data w-24 shrink-0 font-semibold text-text-main">
                {s.year} {s.model}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-main">{s.description}</p>
                <p className="font-data text-xs text-text-dim">{s.serialNumber}</p>
              </div>
              <Badge>{s.branch}</Badge>
              <Badge tone="success">{s.status}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
