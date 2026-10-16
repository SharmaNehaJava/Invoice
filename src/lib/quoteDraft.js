import { CATALOG_ITEMS, CUSTOM_PROGRAM_ID, FINANCE_PROGRAMS } from "../data/catalogData";

export const findItem = (itemId) => CATALOG_ITEMS.find((i) => i.id === itemId) ?? CATALOG_ITEMS[0];

// Pick the bulletin that matches the machine's brand, or fall back to custom terms.
export function programForBrand(brand) {
  return FINANCE_PROGRAMS.find((p) => p.brands.includes(brand))?.id ?? CUSTOM_PROGRAM_ID;
}

export function draftForItem(item, previous = {}) {
  return {
    quoteId: null,
    customer: "",
    marginPct: 20,
    downPayment: 0,
    customRate: 5.99,
    customMonths: 48,
    ...previous,
    itemId: item.id,
    listPrice: item.listPrice,
    discountPct: item.dealerDiscount,
    pdi: item.defaultPdi,
    freight: item.defaultFreight,
    programId: programForBrand(item.brand),
    rateIndex: 0,
  };
}

export const newDraft = () => draftForItem(findItem("DW30-307"));

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
