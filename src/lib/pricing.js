// Pricing rules confirmed against the client's demo video:
//   DW307 @ $107,415, less 24%, PDI $813.60, freight $2,500, 20% margin,
//   0.99% / 60 months  →  $106,186 sell, $1,815/mo, $90.73/day, $11.34/hr.

export const WORKING_DAYS_PER_MONTH = 20;
export const HOURS_PER_DAY = 8;
export const HOURS_PER_MONTH = WORKING_DAYS_PER_MONTH * HOURS_PER_DAY;
export const MARGIN_PRESETS = [15, 17, 20, 22, 25];
export const TARGET_MARGIN = { min: 17, max: 20 };

export const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const sum = (rows, key) => rows.reduce((total, row) => total + row[key], 0);

// Margin is on the sell price (house margin), not a markup on cost:
// sell = cost / (1 - margin%).
export const sellFromCost = (cost, marginPct) => {
  const margin = toNumber(marginPct);
  return margin < 100 ? cost / (1 - margin / 100) : cost;
};

// Margin needed to hit a negotiated price, rounded to 0.01%.
export const marginForPrice = (cost, price) => {
  const p = toNumber(price);
  if (p <= 0) return 0;
  return Math.round((1 - cost / p) * 10000) / 100;
};

// Freight is entered once for the whole quote. When the quote is itemized,
// each line carries a share of it in proportion to its cost.
export function priceQuote({ lines = [], freight, marginPct }) {
  const rows = lines.map((line) => {
    const qty = Math.max(0, toNumber(line.qty));
    const listTotal = toNumber(line.listPrice) * qty;
    const discountAmount = listTotal * (toNumber(line.discountPct) / 100);
    const dealerCost = listTotal - discountAmount;
    const pdiTotal = toNumber(line.pdi) * qty;
    return { line, qty, listTotal, discountAmount, dealerCost, pdiTotal, cost: dealerCost + pdiTotal };
  });

  const goodsCost = sum(rows, "cost");
  const freightTotal = toNumber(freight);
  const totalCost = goodsCost + freightTotal;
  const sellPrice = sellFromCost(totalCost, marginPct);

  const itemized = rows.map((row) => {
    const freightShare = goodsCost > 0 ? (freightTotal * row.cost) / goodsCost : freightTotal / rows.length;
    return { ...row, freightShare, sellPrice: sellFromCost(row.cost + freightShare, marginPct) };
  });

  return {
    rows: itemized,
    listTotal: sum(rows, "listTotal"),
    discountAmount: sum(rows, "discountAmount"),
    dealerCost: sum(rows, "dealerCost"),
    pdiTotal: sum(rows, "pdiTotal"),
    freight: freightTotal,
    totalCost,
    sellPrice,
    grossProfit: sellPrice - totalCost,
  };
}

export function monthlyPayment(principal, annualRatePct, months) {
  const p = toNumber(principal);
  const n = Math.round(toNumber(months));
  if (p <= 0 || n <= 0) return 0;

  const r = toNumber(annualRatePct) / 100 / 12;
  if (r === 0) return p / n;
  return (p * r) / (1 - Math.pow(1 + r, -n));
}

export function financeQuote({ sellPrice, downPayment, tradeIn, ratePercent, months }) {
  const principal = Math.max(0, toNumber(sellPrice) - toNumber(downPayment) - toNumber(tradeIn));
  const monthly = monthlyPayment(principal, ratePercent, months);
  const daily = monthly / WORKING_DAYS_PER_MONTH;
  return {
    principal,
    monthly,
    daily,
    hourly: daily / HOURS_PER_DAY,
  };
}

export function formatMoney(value, decimals = 0) {
  return toNumber(value).toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatRate(ratePercent, months) {
  return `${toNumber(ratePercent).toFixed(2)}% / ${months} mo`;
}

export function lineLabel(line) {
  if (!line) return "";
  return line.variant ? `${line.model} — ${line.variant}` : line.model;
}

// Short name for a whole quote, e.g. "Avant 750 — GT cab + 2 more".
export function quoteLabel(lines = []) {
  if (!lines.length) return "No items";
  const extra = lines.length - 1;
  return extra > 0 ? `${lineLabel(lines[0])} + ${extra} more` : lineLabel(lines[0]);
}

const qtyPrefix = (row) => (row.qty !== 1 ? `${row.qty} × ` : "");

// Plain text that pastes cleanly into an SMS or chat.
export function customerQuoteText({ pricing, finance, rate, repName, tradeIn, itemize }) {
  const { rows } = pricing;
  const lines = ["CC Equipment quote"];

  if (itemize && rows.length > 1) {
    rows.forEach((row) => lines.push(`- ${qtyPrefix(row)}${lineLabel(row.line)}: ${formatMoney(row.sellPrice, 2)}`));
  } else {
    rows.forEach((row) => lines.push(`- ${qtyPrefix(row)}${lineLabel(row.line)}`));
  }

  lines.push(`Price: ${formatMoney(pricing.sellPrice, 2)} + tax (includes PDI and freight)`);
  if (toNumber(tradeIn) > 0) lines.push(`Less trade-in: ${formatMoney(tradeIn, 2)}`);

  if (finance.monthly > 0) {
    lines.push(
      `Finance: ${formatMoney(finance.monthly, 2)}/month over ${rate.months} months at ${toNumber(rate.ratePercent).toFixed(2)}% (OAC)`,
      `That's about ${formatMoney(finance.daily, 2)}/day or ${formatMoney(finance.hourly, 2)}/hr.`
    );
  }
  if (repName) lines.push(`— ${repName}, CC Equipment`);
  return lines.join("\n");
}

// Detailed breakdown for the sales manager's sign-off.
export function costSheetText({ customer, draft, pricing, finance, rate, programName, itemize }) {
  const row = (label, value) => `${label.padEnd(20, " ")}${value}`;
  const lines = [`COST SHEET FOR REVIEW — ${customer || "No customer yet"}`, ""];

  pricing.rows.forEach((r) => {
    const { line } = r;
    lines.push(`${qtyPrefix(r)}${lineLabel(line)}${line.partNumber ? ` (${line.partNumber})` : ""}`);
    lines.push(
      `  List ${formatMoney(line.listPrice, 2)} less ${toNumber(line.discountPct)}% + PDI ${formatMoney(line.pdi, 2)} = ${formatMoney(r.cost, 2)}`
    );
    if (itemize && pricing.rows.length > 1) {
      lines.push(`  Freight share ${formatMoney(r.freightShare, 2)} → sell ${formatMoney(r.sellPrice, 2)}`);
    }
  });

  lines.push(
    "",
    row("List total", formatMoney(pricing.listTotal, 2)),
    row("Less discounts", `-${formatMoney(pricing.discountAmount, 2)}`),
    row("Dealer cost", formatMoney(pricing.dealerCost, 2)),
    row("PDI", formatMoney(pricing.pdiTotal, 2)),
    row("Factory freight", formatMoney(pricing.freight, 2)),
    row("Total cost", formatMoney(pricing.totalCost, 2)),
    row(`Margin ${toNumber(draft.marginPct)}%`, formatMoney(pricing.grossProfit, 2)),
    row("Sell price", formatMoney(pricing.sellPrice, 2))
  );

  if (finance.monthly > 0) {
    lines.push("", `Finance: ${programName}, ${formatRate(rate.ratePercent, rate.months)}`);
    if (toNumber(draft.downPayment) > 0) lines.push(row("Down payment", formatMoney(draft.downPayment, 2)));
    if (toNumber(draft.tradeIn) > 0) lines.push(row("Trade-in", formatMoney(draft.tradeIn, 2)));
    lines.push(
      row("Monthly", formatMoney(finance.monthly, 2)),
      row("Per day / hour", `${formatMoney(finance.daily, 2)} / ${formatMoney(finance.hourly, 2)}`)
    );
  }
  return lines.join("\n");
}
