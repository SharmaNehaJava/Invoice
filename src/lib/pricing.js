// Pricing rules confirmed against the client's demo video:
//   DW307 @ $107,415, less 24%, PDI $813.60, freight $2,500, 20% margin,
//   0.99% / 60 months  →  $106,186 sell, $1,815/mo, $90.73/day, $11.34/hr.

export const WORKING_DAYS_PER_MONTH = 20;
export const HOURS_PER_DAY = 8;
export const MARGIN_PRESETS = [15, 17, 20, 22, 25];
export const TARGET_MARGIN = { min: 17, max: 20 };

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

// Margin is on the sell price (house margin), not a markup on cost:
// sell = cost / (1 - margin%).
export function priceQuote({ listPrice, discountPct, pdi, freight, marginPct }) {
  const list = toNumber(listPrice);
  const discountAmount = list * (toNumber(discountPct) / 100);
  const dealerCost = list - discountAmount;
  const totalCost = dealerCost + toNumber(pdi) + toNumber(freight);
  const margin = toNumber(marginPct);
  const sellPrice = margin < 100 ? totalCost / (1 - margin / 100) : totalCost;

  return {
    discountAmount,
    dealerCost,
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

export function financeQuote({ sellPrice, downPayment, ratePercent, months }) {
  const principal = Math.max(0, toNumber(sellPrice) - toNumber(downPayment));
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

export function machineLabel(item) {
  if (!item) return "";
  return `${item.model} — ${item.variant}`;
}

// Plain text that pastes cleanly into an SMS or chat.
export function customerQuoteText({ item, pricing, finance, rate, repName }) {
  const lines = [
    `CC Equipment quote — ${machineLabel(item)}`,
    `Price: ${formatMoney(pricing.sellPrice, 2)} + tax`,
  ];
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
export function costSheetText({ customer, item, inputs, pricing, finance, rate, programName }) {
  const row = (label, value) => `${label.padEnd(18, " ")}${value}`;
  const lines = [
    `COST SHEET FOR REVIEW — ${customer || "No customer yet"}`,
    `${machineLabel(item)}${item.partNumber ? ` (${item.partNumber})` : ""}`,
    "",
    row("List price", formatMoney(inputs.listPrice, 2)),
    row(`Less ${toNumber(inputs.discountPct)}%`, `-${formatMoney(pricing.discountAmount, 2)}`),
    row("Dealer cost", formatMoney(pricing.dealerCost, 2)),
    row("PDI", formatMoney(inputs.pdi, 2)),
    row("Factory freight", formatMoney(inputs.freight, 2)),
    row("Total cost", formatMoney(pricing.totalCost, 2)),
    row(`Margin ${toNumber(inputs.marginPct)}%`, formatMoney(pricing.grossProfit, 2)),
    row("Sell price", formatMoney(pricing.sellPrice, 2)),
  ];
  if (finance.monthly > 0) {
    lines.push(
      "",
      `Finance: ${programName}, ${formatRate(rate.ratePercent, rate.months)}`,
      row("Down payment", formatMoney(inputs.downPayment, 2)),
      row("Monthly", formatMoney(finance.monthly, 2)),
      row("Per day / hour", `${formatMoney(finance.daily, 2)} / ${formatMoney(finance.hourly, 2)}`)
    );
  }
  return lines.join("\n");
}
