import { useCallback, useEffect, useRef, useState } from "react";
import AppShell from "./components/AppShell";
import { NAV_ITEMS } from "./lib/nav";
import QuotePage from "./pages/QuotePage";
import CustomersPage from "./pages/CustomersPage";
import QuotesPage from "./pages/QuotesPage";
import CalendarPage from "./pages/CalendarPage";
import StockPage from "./pages/StockPage";
import BulletinsPage from "./pages/BulletinsPage";
import AskPage from "./pages/AskPage";
import usePersistentState from "./hooks/usePersistentState";
import { newDraft, normalizeDraft } from "./lib/quoteDraft";
import {
  INITIAL_CALENDAR_EVENTS,
  INITIAL_CUSTOMERS,
  INITIAL_FEEDBACK,
  INITIAL_QUOTES,
  INITIAL_ACTIVITIES,
} from "./data/mockRecords";
import { daysFromToday } from "./lib/dates";

const DEFAULT_USER = { name: "Jake", email: "jake@ccequipment.ca" };
const ROUTES = NAV_ITEMS.map((n) => n.id);

const routeFromHash = () => {
  const id = window.location.hash.replace(/^#\/?/, "");
  return ROUTES.includes(id) ? id : "quote";
};

function useHashRoute() {
  const [route, setRoute] = useState(routeFromHash);
  useEffect(() => {
    const onChange = () => setRoute(routeFromHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const navigate = useCallback((id) => {
    window.location.hash = `/${id}`;
    window.scrollTo(0, 0);
  }, []);
  return [route, navigate];
}

function nextQuoteId(quotes) {
  const max = quotes.reduce((m, q) => Math.max(m, Number(q.id.replace(/\D/g, "")) || 0), 1000);
  return `Q-${max + 1}`;
}

export default function App() {
  const [route, navigate] = useHashRoute();
  const [theme, setTheme] = usePersistentState("cc.theme", "light");
  const [user, setUser] = usePersistentState("cc.user", DEFAULT_USER);
  const [branch, setBranch] = usePersistentState("cc.branch", "05 · Nanaimo, BC");
  // Left blank until the rep enters their own commission rate.
  const [commissionPct, setCommissionPct] = usePersistentState("cc.commissionPct", "");

  // Older saved drafts held a single machine; normalizeDraft upgrades them.
  const [storedDraft, setStoredDraft] = usePersistentState("cc.draft", newDraft);
  const draft = normalizeDraft(storedDraft);
  const setDraft = useCallback(
    (next) =>
      setStoredDraft((prev) => {
        const current = normalizeDraft(prev);
        return typeof next === "function" ? next(current) : next;
      }),
    [setStoredDraft]
  );
  const [quotes, setQuotes] = usePersistentState("cc.quotes", INITIAL_QUOTES);
  const [customers, setCustomers] = usePersistentState("cc.customers", INITIAL_CUSTOMERS);
  const [events, setEvents] = usePersistentState("cc.events", INITIAL_CALENDAR_EVENTS);
  const [feedback] = usePersistentState("cc.feedback", INITIAL_FEEDBACK);
  const [activities, setActivities] = usePersistentState("cc.activities", INITIAL_ACTIVITIES);
  // Which customer to show when jumping to the Customers page from elsewhere.
  const [customerFocus, setCustomerFocus] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const notify = useCallback((message, tone = "success") => {
    setToast({ message, tone });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#101419" : "#f4f5f7");
  }, [theme]);

  const addCustomer = (data) => {
    const id = `C-${Date.now()}`;
    setCustomers((list) => [...list, { id, contact: "", phone: "", email: "", ...data }]);
    return id;
  };

  const ensureCustomer = (name) => {
    const trimmed = name.trim();
    if (trimmed && !customers.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      addCustomer({ name: trimmed });
    }
  };

  // Create or update a quote from the desk; returns its id.
  const saveQuote = (currentDraft, { status, machine, sellPrice }) => {
    const id = currentDraft.quoteId ?? nextQuoteId(quotes);
    const existing = quotes.find((q) => q.id === id);
    const record = {
      ...existing,
      id,
      customer: currentDraft.customer.trim(),
      machine,
      sellPrice,
      status,
      note: status === "review" ? "Cost sheet sent for Sheldon's sign-off." : "",
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      draft: { ...currentDraft, quoteId: id },
    };
    setQuotes((list) =>
      list.some((q) => q.id === id) ? list.map((q) => (q.id === id ? record : q)) : [record, ...list]
    );
    ensureCustomer(currentDraft.customer);
    return id;
  };

  const openQuote = (quote) => {
    if (!quote.draft) return;
    setDraft(normalizeDraft({ ...quote.draft, quoteId: quote.id }));
    navigate("quote");
  };

  const startQuoteFor = (customer) => {
    setDraft({ ...newDraft(), customer });
    navigate("quote");
  };

  const logActivity = (customer, entry) => {
    setActivities((list) => [
      { id: `A-${Date.now()}`, customer, done: false, createdAt: new Date().toISOString(), ...entry },
      ...list,
    ]);
    notify(entry.followUp ? "Call logged and follow-up set" : "Call logged");
  };
  const toggleActivity = (id) =>
    setActivities((list) => list.map((a) => (a.id === id ? { ...a, done: !a.done } : a)));
  const deleteActivity = (id) => setActivities((list) => list.filter((a) => a.id !== id));

  const openCustomer = (name) => {
    setCustomerFocus(name);
    navigate("customers");
  };

  const pendingReview = quotes.filter((q) => q.status === "review").length;
  const followUpsDue = activities.filter((a) => a.followUp && !a.done && daysFromToday(a.followUp) <= 0).length;

  const pages = {
    quote: (
      <QuotePage
        draft={draft}
        setDraft={setDraft}
        customers={customers}
        repName={user?.name}
        onSaveQuote={saveQuote}
        notify={notify}
        commissionPct={commissionPct}
        onCommissionChange={setCommissionPct}
      />
    ),
    customers: (
      <CustomersPage
        customers={customers}
        quotes={quotes}
        events={events}
        feedback={feedback}
        activities={activities}
        focusCustomer={customerFocus}
        onLogActivity={logActivity}
        onToggleActivity={toggleActivity}
        onDeleteActivity={deleteActivity}
        onAddCustomer={addCustomer}
        onOpenQuote={openQuote}
        onQuoteFor={startQuoteFor}
        notify={notify}
      />
    ),
    quotes: (
      <QuotesPage
        quotes={quotes}
        onOpen={openQuote}
        onStatusChange={(id, status) =>
          setQuotes((list) =>
            list.map((q) =>
              q.id === id
                ? { ...q, status, note: status === "approved" ? "Approved by Sheldon." : q.note }
                : q
            )
          )
        }
        onDelete={(id) => setQuotes((list) => list.filter((q) => q.id !== id))}
        onNewQuote={() => startQuoteFor("")}
      />
    ),
    calendar: (
      <CalendarPage
        events={events}
        customers={customers}
        onAdd={(ev) => setEvents((list) => [ev, ...list])}
        onUpdate={(ev) => setEvents((list) => list.map((e) => (e.id === ev.id ? ev : e)))}
        onDelete={(id) => setEvents((list) => list.filter((e) => e.id !== id))}
        activities={activities}
        onToggleActivity={toggleActivity}
        onOpenCustomer={openCustomer}
      />
    ),
    stock: <StockPage />,
    bulletins: <BulletinsPage />,
    ask: <AskPage />,
  };

  return (
    <AppShell
      route={route}
      onNavigate={navigate}
      badges={{ quotes: pendingReview, calendar: followUpsDue }}
      topBar={{
        user,
        onSignIn: () => setUser(DEFAULT_USER),
        onSignOut: () => setUser(null),
        theme,
        onToggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
        branch,
        onBranchChange: setBranch,
      }}
    >
      {pages[route]}

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-36 z-50 flex justify-center px-4 lg:bottom-20 xl:bottom-6">
        {toast && (
          <div
            className={`pointer-events-auto rounded-lg border px-4 py-2.5 text-sm font-medium shadow-lg ${
              toast.tone === "error"
                ? "border-error/30 bg-error-subtle text-error"
                : "border-success/30 bg-success-subtle text-success"
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </AppShell>
  );
}
