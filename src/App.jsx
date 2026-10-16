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
import SettingsPage from "./pages/SettingsPage";
import usePersistentState from "./hooks/usePersistentState";
import useEmailTracking from "./hooks/useEmailTracking";
import { fetchEmailConfig } from "./lib/emailApi";
import { newDraft, normalizeDraft } from "./lib/quoteDraft";
import {
  INITIAL_CALENDAR_EVENTS,
  INITIAL_CUSTOMERS,
  INITIAL_FEEDBACK,
  INITIAL_QUOTES,
  INITIAL_ACTIVITIES,
} from "./data/mockRecords";
import { daysFromToday } from "./lib/dates";

const DEFAULT_SETTINGS = {
  rep: { name: "Jake", email: "", phone: "" },
  manager: { name: "", email: "" },
  company: { name: "CC Equipment", phone: "", address: "Nanaimo, BC", website: "", validDays: 30 },
};
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
  const [settings, setSettings] = usePersistentState("cc.settings", DEFAULT_SETTINGS);
  const [signedIn, setSignedIn] = usePersistentState("cc.signedIn", true);
  const user = signedIn ? settings.rep : null;
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
  // Every email sent from the app, with its latest tracking status.
  const [emails, setEmails] = usePersistentState("cc.emails", []);
  // true = real sending, false = demo mode, "unavailable" = no email server.
  const [emailLive, setEmailLive] = useState(null);
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
    fetchEmailConfig()
      .then((config) => setEmailLive(config.live))
      .catch(() => setEmailLive("unavailable"));
  }, []);

  useEmailTracking(emails, setEmails, notify);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#101419" : "#f4f5f7");
  }, [theme]);

  const addCustomer = (data) => {
    const id = `C-${Date.now()}`;
    setCustomers((list) => [...list, { id, contact: "", phone: "", email: "", ...data }]);
    return id;
  };

  // Quotes, notes and events refer to customers by name, so a rename
  // is carried through to them.
  const updateCustomer = (id, data) => {
    const before = customers.find((c) => c.id === id);
    setCustomers((list) => list.map((c) => (c.id === id ? { ...c, ...data } : c)));
    if (before && data.name && data.name !== before.name) {
      const rename = (x) => (x.customer === before.name ? { ...x, customer: data.name } : x);
      setQuotes((list) => list.map(rename));
      setActivities((list) => list.map(rename));
      setEvents((list) => list.map(rename));
      setDraft((d) => rename(d));
    }
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
      status: status ?? existing?.status ?? "draft",
      note:
        status === "review"
          ? "Cost sheet sent to the sales manager for approval."
          : status === undefined
            ? existing?.note ?? ""
            : "",
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

  // Called once per email the quote desk sends.
  const recordEmail = (email) => {
    setEmails((list) => [{ ...email, status: "sent", history: [{ status: "sent", at: email.sentAt }] }, ...list]);
    setActivities((list) => [
      {
        id: `A-${Date.now()}-${email.kind}`,
        customer: email.customer,
        note:
          email.kind === "customer"
            ? `Emailed quote ${email.quoteId} to ${email.to}.`
            : `Sent cost sheet for ${email.quoteId} to the sales manager (${email.to}) for approval.`,
        followUp: email.followUp ?? "",
        quoteId: email.quoteId,
        emailId: email.id,
        done: false,
        createdAt: email.sentAt,
      },
      ...list,
    ]);
  };

  const updateSettings = (patch) =>
    setSettings((s) => ({
      ...s,
      ...Object.fromEntries(Object.entries(patch).map(([key, value]) => [key, { ...s[key], ...value }])),
    }));

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
        repName={settings.rep.name}
        settings={settings}
        onSaveQuote={saveQuote}
        notify={notify}
        commissionPct={commissionPct}
        onCommissionChange={setCommissionPct}
        emailLive={emailLive}
        onEmailSent={recordEmail}
        onUpdateSettings={updateSettings}
        onAddCustomer={addCustomer}
        onUpdateCustomer={updateCustomer}
      />
    ),
    customers: (
      <CustomersPage
        customers={customers}
        quotes={quotes}
        events={events}
        feedback={feedback}
        activities={activities}
        emails={emails}
        focusCustomer={customerFocus}
        onLogActivity={logActivity}
        onUpdateCustomer={updateCustomer}
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
        emails={emails}
        onOpen={openQuote}
        onStatusChange={(id, status) =>
          setQuotes((list) =>
            list.map((q) =>
              q.id === id
                ? { ...q, status, note: status === "approved" ? "Approved by the sales manager." : q.note }
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
        emails={emails}
        onToggleActivity={toggleActivity}
        onOpenCustomer={openCustomer}
      />
    ),
    stock: <StockPage />,
    bulletins: <BulletinsPage />,
    ask: <AskPage />,
    settings: <SettingsPage settings={settings} onSave={setSettings} notify={notify} />,
  };

  return (
    <AppShell
      route={route}
      onNavigate={navigate}
      badges={{ quotes: pendingReview, calendar: followUpsDue }}
      topBar={{
        user,
        onSignIn: () => setSignedIn(true),
        onSignOut: () => setSignedIn(false),
        theme,
        onToggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
        branch,
        onBranchChange: setBranch,
      }}
    >
      {pages[route]}

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-36 z-50 flex justify-center px-4 lg:bottom-20 xl:bottom-6 print:hidden">
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
