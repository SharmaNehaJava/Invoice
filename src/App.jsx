import { useState } from "react";
import Header from "./components/Header";
import HeaderDrawers from "./components/HeaderDrawers";
import LeftSidebar from "./components/LeftSidebar";
import QuoteDesk from "./components/QuoteDesk";
import RightSidebar from "./components/RightSidebar";

import {
  INITIAL_QUOTES,
  INITIAL_APPROVALS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_FEEDBACK,
} from "./data/mockRecords";

export default function App() {
  const [user, setUser] = useState({
    name: "Jake",
    email: "jake@ccequipment.ca",
  });

  const [activeModal, setActiveModal] = useState(null);

  const [quotes, setQuotes] = useState(INITIAL_QUOTES);
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS);
  const [calendarEvents, setCalendarEvents] = useState(INITIAL_CALENDAR_EVENTS);
  const [feedback] = useState(INITIAL_FEEDBACK);
  const [currentQuote, setCurrentQuote] = useState(null);

  // Send quote to Sheldon
  const handleSendToSheldon = (quoteData) => {
    const newApproval = {
      id: `APP-0${approvals.length + 1}`,
      quoteId: `Q-100${quotes.length + 1}`,
      customer: quoteData.customer || "Current Prospect",
      machine: quoteData.machineName,
      status: "PENDING REVIEW",
      managerNote: `Markup submitted at ${quoteData.markup}%. Awaiting Sheldon's sign-off.`,
      timestamp: "Just now",
    };

    setApprovals([newApproval, ...approvals]);

    const newQuoteRecord = {
      id: newApproval.quoteId,
      customer: quoteData.customer || "Current Prospect",
      contact: "Rep Jake",
      machine: quoteData.machineName,
      totalPrice: quoteData.sellPrice,
      date: new Date().toISOString().split("T")[0],
      status: "Pending Review",
    };
    setQuotes([newQuoteRecord, ...quotes]);
    setActiveModal("inbox");
  };

  // Calendar Event Handlers
  const handleAddCalendarEvent = (newEvent) => {
    setCalendarEvents([newEvent, ...calendarEvents]);
  };

  const handleUpdateCalendarEvent = (updated) => {
    setCalendarEvents(calendarEvents.map((ev) => (ev.id === updated.id ? updated : ev)));
  };

  const handleDeleteCalendarEvent = (id) => {
    setCalendarEvents(calendarEvents.filter((ev) => ev.id !== id));
  };

  // Simulate manager approval
  const handleApproveQuote = (appId) => {
    setApprovals(
      approvals.map((a) =>
        a.id === appId
          ? { ...a, status: "APPROVED", managerNote: "Approved by Sheldon at current terms." }
          : a
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#101419] text-[#e8edf2] p-4 font-mono select-none">
      <Header
        user={user}
        onSignOut={() => setUser(null)}
        onSignIn={() => setUser({ name: "Jake", email: "jake@ccequipment.ca" })}
        onNavigate={(drawerName) => setActiveModal(drawerName)}
      />

      <HeaderDrawers
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        quotes={quotes}
        approvals={approvals}
        calendarEvents={calendarEvents}
        feedback={feedback}
        onLoadQuote={(loaded) => setCurrentQuote(loaded)}
        onAddCalendarEvent={handleAddCalendarEvent}
        onUpdateCalendarEvent={handleUpdateCalendarEvent}
        onDeleteCalendarEvent={handleDeleteCalendarEvent}
        onApproveQuote={handleApproveQuote}
      />

      {/* 3-Column Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3">
          <LeftSidebar />
        </div>
        <div className="lg:col-span-6">
          <QuoteDesk
            onSendToSheldon={handleSendToSheldon}
            loadedQuote={currentQuote}
          />
        </div>
        <div className="lg:col-span-3">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}