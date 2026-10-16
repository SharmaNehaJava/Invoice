export function formatTimestamp(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Dates are stored as local "YYYY-MM-DD" strings so a follow-up set for
// Tuesday stays on Tuesday regardless of time zone.
const pad = (n) => String(n).padStart(2, "0");

export function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const todayISO = () => toISODate(new Date());

function fromISODate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso, days) {
  const date = fromISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

// Whole days from today; negative means overdue.
export function daysFromToday(iso) {
  const ms = fromISODate(iso) - fromISODate(todayISO());
  return Math.round(ms / 86_400_000);
}

export function formatDay(iso) {
  if (!iso) return "";
  return fromISODate(iso).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
}

export function describeDue(iso) {
  const days = daysFromToday(iso);
  if (days < 0) return { label: `Overdue ${-days} d`, tone: "error" };
  if (days === 0) return { label: "Due today", tone: "warning" };
  if (days === 1) return { label: "Tomorrow", tone: "info" };
  return { label: formatDay(iso), tone: "neutral" };
}
