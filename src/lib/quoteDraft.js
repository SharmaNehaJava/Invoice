import { CATALOG_ITEMS, CUSTOM_PROGRAM_ID, FINANCE_PROGRAMS } from "../data/catalogData";

export const findItem = (itemId) => CATALOG_ITEMS.find((i) => i.id === itemId);

// Pick the bulletin that matches the machine's brand, or fall back to custom terms.
export function programForBrand(brand) {
  return FINANCE_PROGRAMS.find((p) => p.brands.includes(brand))?.id ?? CUSTOM_PROGRAM_ID;
}

let keySeq = 0;
const lineKey = () => `L${Date.now().toString(36)}${(keySeq++).toString(36)}`;

export function lineFromItem(item) {
  return {
    key: lineKey(),
    itemId: item.id,
    model: item.model,
    variant: item.variant,
    partNumber: item.partNumber,
    brand: item.brand,
    category: item.category,
    qty: 1,
    listPrice: item.listPrice,
    discountPct: item.dealerDiscount,
    pdi: item.defaultPdi,
    rentalMonthly: item.rentalMonthly ?? 0,
  };
}

// For attachments and parts that aren't in the price book yet.
export function customLine() {
  return {
    key: lineKey(),
    itemId: null,
    model: "",
    variant: "",
    partNumber: "",
    brand: "",
    category: "Custom",
    qty: 1,
    listPrice: 0,
    discountPct: 0,
    pdi: 0,
    rentalMonthly: 0,
  };
}

export function emptyDraft() {
  return {
    quoteId: null,
    customer: "",
    lines: [],
    freight: 0,
    marginPct: 20,
    programId: FINANCE_PROGRAMS[0]?.id ?? CUSTOM_PROGRAM_ID,
    rateIndex: 0,
    customRate: 5.99,
    customMonths: 48,
    downPayment: 0,
    tradeIn: 0,
    itemize: false,
    showAllRates: false,
    // Blank means "use the rental sheet rate for the main unit".
    rentalMonthly: "",
    usageHours: 160,
  };
}

export const newDraft = emptyDraft;

// The first machine on a quote sets the freight and the finance bulletin;
// attachments added after it ride on the same freight.
export function addLine(draft, line, item) {
  const isFirst = draft.lines.length === 0;
  return {
    ...draft,
    lines: [...draft.lines, line],
    ...(isFirst && item
      ? { freight: item.defaultFreight, programId: programForBrand(item.brand), rateIndex: 0 }
      : {}),
  };
}

export const addItem = (draft, item) => addLine(draft, lineFromItem(item), item);

// Quotes saved before multi-item quotes held a single machine at the top level.
export function normalizeDraft(draft) {
  const base = emptyDraft();
  if (!draft) return base;
  if (Array.isArray(draft.lines)) return { ...base, ...draft };

  const item = findItem(draft.itemId);
  const lines = item
    ? [{ ...lineFromItem(item), listPrice: draft.listPrice, discountPct: draft.discountPct, pdi: draft.pdi }]
    : [];
  const rest = { ...draft };
  ["itemId", "listPrice", "discountPct", "pdi"].forEach((key) => delete rest[key]);
  return { ...base, ...rest, lines };
}

// Resolve the active programme and rate for a draft.
export function activeFinance(draft) {
  if (draft.programId === CUSTOM_PROGRAM_ID) {
    return {
      programName: "Custom terms",
      rate: { ratePercent: Number(draft.customRate) || 0, months: Number(draft.customMonths) || 0 },
    };
  }
  const program = FINANCE_PROGRAMS.find((p) => p.id === draft.programId) ?? FINANCE_PROGRAMS[0];
  return {
    programName: program.name,
    rate: program.rates[draft.rateIndex] ?? program.rates[0],
  };
}
