// Seed data used the first time the app runs on a device.
// After that, everything lives in browser storage (see usePersistentState).

export const QUOTE_STATUSES = {
  draft: { label: "Draft", tone: "neutral" },
  review: { label: "Awaiting approval", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  sent: { label: "Sent to customer", tone: "info" },
};

export const INITIAL_CUSTOMERS = [
  { id: "C-01", name: "RG Excavating", contact: "Jeff", phone: "", email: "" },
  { id: "C-02", name: "Garden City Landscaping", contact: "Grant", phone: "", email: "" },
  { id: "C-03", name: "Miller's Tree Service", contact: "", phone: "", email: "" },
  { id: "C-04", name: "Arbutus Ridge Golf Club", contact: "", phone: "", email: "" },
];

// `draft` holds the quote-desk inputs so a saved quote can be reopened.
// The two seed quotes predate the desk, so they have no draft.
export const INITIAL_QUOTES = [
  {
    id: "Q-1001",
    customer: "RG Excavating",
    machine: "DW30 — ROPS, standard tires",
    sellPrice: 101250,
    status: "approved",
    note: "Approved by the sales manager at 20% margin. Standard freight applied.",
    createdAt: "2026-10-06T10:30:00",
    draft: null,
  },
  {
    id: "Q-1002",
    customer: "Garden City Landscaping",
    machine: "Avant multi-function + weed brush",
    sellPrice: 45500,
    status: "review",
    note: "Awaiting sales manager review on custom PDI rate.",
    createdAt: "2026-10-05T11:46:00",
    draft: null,
  },
];

export const INITIAL_CALENDAR_EVENTS = [
  {
    id: "EV-01",
    time: "09:00 WED",
    title: "Demo: Bandit 90XP",
    location: "Arbutus Ridge Golf Club",
    customer: "Arbutus Ridge Golf Club",
    type: "DEMO",
    status: "SCHEDULED",
  },
  {
    id: "EV-02",
    time: "14:00 THU",
    title: "Follow up: Avant replacement",
    location: "Job Site #4",
    customer: "Garden City Landscaping",
    type: "FOLLOW-UP",
    status: "SCHEDULED",
  },
];

export const INITIAL_FEEDBACK = [
  {
    id: "FB-01",
    customer: "RG Excavating",
    machine: "DW30 dumper",
    rating: 5,
    comment: "DW30 handled the steep wet clay bank easily. Want lease rates for 48 months.",
    date: "Oct 4, 2026",
  },
  {
    id: "FB-02",
    customer: "Miller's Tree Service",
    machine: "Bandit 90XP chipper",
    rating: 4,
    comment: "High processing speed, great hydraulics. Need to check trade-in value on our old unit.",
    date: "Oct 2, 2026",
  },
];

// Call notes logged against a customer. `followUp` is a local YYYY-MM-DD date.
export const INITIAL_ACTIVITIES = [
  {
    id: "A-01",
    customer: "RG Excavating",
    note: "Spoke to Jeff. Sent the DW30 quote; the sales manager approved it at 20%. He's comparing against renting.",
    followUp: "2026-10-24",
    quoteId: "Q-1001",
    done: false,
    createdAt: "2026-10-06T10:45:00",
  },
];
