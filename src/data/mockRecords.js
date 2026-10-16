export const INITIAL_QUOTES = [
  {
    id: "Q-1001",
    customer: "RG Excavating",
    contact: "Jeff",
    machine: "DW30 Wheel Dumper ROPS, Standard Tires",
    totalPrice: 107415,
    date: "2026-10-06",
    status: "Approved",
  },
  {
    id: "Q-1002",
    customer: "Garden City Landscaping",
    contact: "Grant",
    machine: "Avant Multi-Function + Weed Brush",
    totalPrice: 48900,
    date: "2026-10-05",
    status: "Pending Review",
  },
];

export const INITIAL_APPROVALS = [
  {
    id: "APP-01",
    quoteId: "Q-1001",
    customer: "RG Excavating",
    machine: "DW30 Wheel Dumper",
    status: "APPROVED",
    managerNote: "Approved by Sheldon at 20% markup. Standard freight applied.",
    timestamp: "10:30 AM Today",
  },
  {
    id: "APP-02",
    quoteId: "Q-1002",
    customer: "Garden City Landscaping",
    machine: "Avant Loader with Attachments",
    status: "PENDING REVIEW",
    managerNote: "Awaiting Sheldon review on custom PDI rate.",
    timestamp: "11:46 AM Today",
  },
];

export const INITIAL_CALENDAR_EVENTS = [
  {
    id: "EV-01",
    time: "09:00 WED",
    title: "Demo: Bandit 90XP",
    location: "Arbutus Ridge Golf Club",
    customer: "Golf Course Ops",
    type: "DEMO",
  },
  {
    id: "EV-02",
    time: "14:00 THU",
    title: "Follow up: Avant replacement",
    location: "Job Site #4",
    customer: "Garden City Landscaping",
    type: "FOLLOW-UP",
  },
];

export const INITIAL_FEEDBACK = [
  {
    id: "FB-01",
    customer: "RG Excavating",
    machine: "DW30 Dumper",
    rating: "5/5",
    comment: "DW30 handled the steep wet clay bank easily. Want lease rates for 48 months.",
    date: "Oct 4, 2026",
  },
  {
    id: "FB-02",
    customer: "Miller's Tree Service",
    machine: "Bandit 90XP Chipper",
    rating: "4/5",
    comment: "High processing speed, great hydraulics. Need to check trade-in value on our old unit.",
    date: "Oct 2, 2026",
  },
];