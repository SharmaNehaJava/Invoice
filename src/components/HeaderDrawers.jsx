import { useState } from "react";

export default function HeaderDrawers({
  activeModal,
  onClose,
  quotes,
  approvals,
  calendarEvents,
  feedback,
  onLoadQuote,
  onAddCalendarEvent,
  onUpdateCalendarEvent,
  onDeleteCalendarEvent,
  onApproveQuote,
}) {
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");

  // Calendar Form State (Shared for Add & Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventCustomer, setEventCustomer] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventType, setEventType] = useState("DEMO");
  const [eventStatus, setEventStatus] = useState("SCHEDULED");
  const [eventLocation, setEventLocation] = useState("");

  if (!activeModal) return null;

  const handleAskClaude = (query) => {
    const q = (query || aiQuestion).toLowerCase();
    if (q.includes("rate") || q.includes("finance") || q.includes("cc special")) {
      setAiAnswer(
        "CC Specials: 3.99% for 48 months on DW30/DW50 dumpers. Standard commercial rate is 6.99% for 60 months."
      );
    } else if (q.includes("insurance") || q.includes("consignment")) {
      setAiAnswer(
        "Watch List Rule: Check commercial liability insurance at the start of consignment, not at funding."
      );
    } else if (q.includes("pdi")) {
      setAiAnswer(
        "Service Policy: PDI is billed at $170/hr. Reversible plates and dumpers default to 1-2 hrs ($170-$340). Boxed units: $0."
      );
    } else {
      setAiAnswer(
        "Dealer Copilot: Ask about active finance rates, consignment insurance rules, or standard PDI hours."
      );
    }
  };

  // Open form for fresh entry
  const startAddEvent = () => {
    setEditingEventId(null);
    setEventTitle("");
    setEventCustomer("");
    setEventTime("09:00 WED");
    setEventType("DEMO");
    setEventStatus("SCHEDULED");
    setEventLocation("Customer Job Site");
    setIsFormOpen(true);
  };

  // Open form to edit an existing event
  const startEditEvent = (ev) => {
    setEditingEventId(ev.id);
    setEventTitle(ev.title);
    setEventCustomer(ev.customer);
    setEventTime(ev.time);
    setEventType(ev.type);
    setEventStatus(ev.status || "SCHEDULED");
    setEventLocation(ev.location || "Customer Job Site");
    setIsFormOpen(true);
  };

  // Save (Create or Update)
  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!eventTitle || !eventCustomer) return;

    if (editingEventId) {
      onUpdateCalendarEvent?.({
        id: editingEventId,
        title: eventTitle,
        customer: eventCustomer,
        time: eventTime,
        type: eventType,
        status: eventStatus,
        location: eventLocation,
      });
    } else {
      onAddCalendarEvent?.({
        id: `EV-${Date.now()}`,
        title: eventTitle,
        customer: eventCustomer,
        time: eventTime,
        type: eventType,
        status: eventStatus,
        location: eventLocation,
      });
    }

    setIsFormOpen(false);
    setEditingEventId(null);
  };

  const getModalTitle = () => {
    switch (activeModal) {
      case "crm":
        return "CRM SHEET — SAVED DEALS";
      case "calendar":
        return "CALENDAR — DEMOS & FIELD AGENDA";
      case "inbox":
        return "JAKE INBOX — APPROVALS";
      case "replies":
        return "FEEDBACK REPLIES — DEMO TRIALS";
      case "ai":
        return "EQUIPMENT AI — COPILOT";
      default:
        return "";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4 font-mono select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[85vh] bg-[#14181f] border border-[#242c35] rounded-xl p-5 overflow-hidden text-[#e8edf2] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex justify-between items-center pb-3 border-b border-[#242c35] mb-4 shrink-0">
          <h2 className="text-xs sm:text-sm font-bold tracking-wider text-[#f0b44d]">
            {getModalTitle()}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#242c35] hover:border-[#f0b44d] text-[#a3afbc] hover:text-[#f0b44d] bg-[#191f26] transition cursor-pointer text-sm"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="space-y-4 overflow-y-auto pr-1">
          {/* 1. CRM SHEET */}
          {activeModal === "crm" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-[#a3afbc]">
                <span>Saved customer quotes ({quotes.length})</span>
                <span className="text-[11px] text-[#677484]">Click row to load</span>
              </div>
              <div className="space-y-2">
                {quotes.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 bg-[#191f26] border border-[#242c35] rounded-lg space-y-1.5 hover:border-[#f0b44d]/50 transition"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#e8edf2]">{q.customer}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          q.status === "Approved"
                            ? "bg-[#16291c] text-[#72d6a0] border border-[#254d2f]"
                            : "bg-[#2e2316] text-[#ffd08a] border border-[#4d361c]"
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#a3afbc]">{q.machine}</div>
                    <div className="flex justify-between items-center pt-2 border-t border-[#242c35]/70 text-xs">
                      <span className="text-[#f0b44d] font-bold">
                        ${q.totalPrice?.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onLoadQuote(q);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-[#242c35] hover:bg-[#f0b44d] hover:text-black rounded text-[11px] font-bold transition cursor-pointer"
                      >
                        Load to Desk
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. CALENDAR */}
          {activeModal === "calendar" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#a3afbc]">
                  Demos, Deliveries & Follow-ups ({calendarEvents.length})
                </span>
                {!isFormOpen && (
                  <button
                    type="button"
                    onClick={startAddEvent}
                    className="px-2.5 py-1 bg-[#f0b44d] text-black font-bold rounded text-[11px] hover:bg-[#d99f3b] transition cursor-pointer"
                  >
                    + Add Event
                  </button>
                )}
              </div>

              {/* Add / Edit Form */}
              {isFormOpen && (
                <form
                  onSubmit={handleSaveEvent}
                  className="p-3.5 bg-[#191f26] border border-[#f0b44d]/50 rounded-lg space-y-2.5 text-xs"
                >
                  <div className="flex justify-between items-center pb-1.5 border-b border-[#242c35]">
                    <span className="text-xs font-bold text-[#f0b44d]">
                      {editingEventId ? "EDIT AGENDA EVENT" : "NEW AGENDA EVENT"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="text-[#a3afbc] hover:text-[#e8edf2] text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#a3afbc] block mb-0.5">
                      TITLE / MACHINE
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Demo: DW30 Wheel Dumper"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="w-full bg-[#101419] border border-[#242c35] rounded px-2.5 py-1 text-xs text-[#e8edf2] focus:border-[#f0b44d] focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[#a3afbc] block mb-0.5">
                        CUSTOMER / CONTACT
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. RG Excavating"
                        value={eventCustomer}
                        onChange={(e) => setEventCustomer(e.target.value)}
                        className="w-full bg-[#101419] border border-[#242c35] rounded px-2.5 py-1 text-xs text-[#e8edf2] focus:border-[#f0b44d] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#a3afbc] block mb-0.5">
                        TIME / DAY
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 09:00 WED"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full bg-[#101419] border border-[#242c35] rounded px-2.5 py-1 text-xs text-[#e8edf2] focus:border-[#f0b44d] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#a3afbc] block mb-0.5">TYPE</label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="w-full bg-[#101419] border border-[#242c35] rounded px-2 py-1 text-xs text-[#e8edf2]"
                      >
                        <option value="DEMO">Demo</option>
                        <option value="DELIVERY">Delivery</option>
                        <option value="FOLLOW-UP">Follow-up</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#a3afbc] block mb-0.5">STATUS</label>
                      <select
                        value={eventStatus}
                        onChange={(e) => setEventStatus(e.target.value)}
                        className="w-full bg-[#101419] border border-[#242c35] rounded px-2 py-1 text-xs text-[#e8edf2]"
                      >
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="IN PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="POSTPONED">Postponed</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#a3afbc] block mb-0.5">LOCATION</label>
                      <input
                        type="text"
                        placeholder="e.g. Golf Club site"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        className="w-full bg-[#101419] border border-[#242c35] rounded px-2 py-1 text-xs text-[#e8edf2] focus:border-[#f0b44d] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#f0b44d] text-black font-bold rounded text-xs hover:bg-[#d99f3b] transition cursor-pointer"
                    >
                      {editingEventId ? "Save Changes" : "Create Event"}
                    </button>
                  </div>
                </form>
              )}

              {/* Event Cards List */}
              <div className="space-y-2">
                {calendarEvents.map((ev) => {
                  const isCompleted = ev.status === "COMPLETED";

                  return (
                    <div
                      key={ev.id}
                      className={`p-3 bg-[#191f26] border rounded-lg space-y-1.5 transition ${
                        isCompleted
                          ? "border-[#242c35] opacity-60"
                          : "border-[#242c35] hover:border-[#f0b44d]/40"
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[#f0b44d] font-bold">{ev.time}</span>
                          <span className="text-[10px] bg-[#242c35] text-[#a3afbc] px-1.5 py-0.5 rounded font-semibold">
                            {ev.type}
                          </span>
                        </div>

                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                            ev.status === "COMPLETED"
                              ? "bg-[#16291c] text-[#72d6a0] border border-[#254d2f]"
                              : ev.status === "IN PROGRESS"
                              ? "bg-[#2e2316] text-[#ffd08a] border border-[#4d361c]"
                              : "bg-[#19222e] text-[#9cc5ff] border border-[#273a52]"
                          }`}
                        >
                          {ev.status || "SCHEDULED"}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-[#e8edf2]">{ev.title}</div>
                      <div className="text-[11px] text-[#a3afbc]">
                        📍 {ev.location} · {ev.customer}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-[#242c35] text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            const nextStatus =
                              ev.status === "COMPLETED"
                                ? "SCHEDULED"
                                : ev.status === "SCHEDULED"
                                ? "IN PROGRESS"
                                : "COMPLETED";
                            onUpdateCalendarEvent?.({ ...ev, status: nextStatus });
                          }}
                          className="text-[#9cc5ff] hover:underline cursor-pointer"
                        >
                          Status: {ev.status || "SCHEDULED"} &rarr;
                        </button>

                        <div className="flex gap-2.5">
                          <button
                            type="button"
                            onClick={() => startEditEvent(ev)}
                            className="text-[#f0b44d] hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCalendarEvent?.(ev.id)}
                            className="text-[#ff8f98] hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. JAKE INBOX */}
          {activeModal === "inbox" && (
            <div className="space-y-3">
              <p className="text-xs text-[#a3afbc]">
                Quotes sent for Sheldon Schlesinger&apos;s sign-off.
              </p>
              <div className="space-y-2">
                {approvals.map((app) => (
                  <div
                    key={app.id}
                    className="p-3 bg-[#191f26] border border-[#242c35] rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#e8edf2]">{app.customer}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          app.status === "APPROVED"
                            ? "bg-[#16291c] text-[#72d6a0] border border-[#254d2f]"
                            : "bg-[#2e2316] text-[#ffd08a] border border-[#4d361c]"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#a3afbc]">{app.machine}</div>
                    <div className="text-xs bg-[#101419] p-2 rounded border border-[#202730] text-[#cbd5e1]">
                      &ldquo;{app.managerNote}&rdquo;
                    </div>
                    {app.status === "PENDING REVIEW" && (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => onApproveQuote?.(app.id)}
                          className="px-2.5 py-1 bg-[#16291c] hover:bg-[#254d2f] text-[#72d6a0] border border-[#254d2f] rounded text-[11px] font-bold transition cursor-pointer"
                        >
                          Simulate Sheldon Approval
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. FEEDBACK REPLIES */}
          {activeModal === "replies" && (
            <div className="space-y-3">
              <p className="text-xs text-[#a3afbc]">
                Operator feedback from past on-site demos.
              </p>
              <div className="space-y-2">
                {feedback.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-3 bg-[#191f26] border border-[#242c35] rounded-lg space-y-1.5"
                  >
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[#f0b44d]">{fb.customer}</span>
                      <span className="text-[#72d6a0] font-bold">{fb.rating}</span>
                    </div>
                    <div className="text-[11px] text-[#a3afbc]">{fb.machine}</div>
                    <p className="text-xs bg-[#101419] p-2 rounded border border-[#202730] text-[#e8edf2] italic">
                      &ldquo;{fb.comment}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. ASK CLAUDE */}
          {activeModal === "ai" && (
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                {[
                  "What are the CC Special rates for dumpers?",
                  "What is our policy on consignment insurance?",
                  "What is standard PDI on attachments?",
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAiQuestion(prompt);
                      handleAskClaude(prompt);
                    }}
                    className="text-left text-xs bg-[#191f26] hover:bg-[#242c35] text-[#d0d7de] p-2 rounded border border-[#202730] transition cursor-pointer"
                  >
                    &rarr; {prompt}
                  </button>
                ))}
              </div>

              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  placeholder="Ask Claude about bulletins, rates, or specs..."
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskClaude()}
                  className="w-full bg-[#101419] border border-[#242c35] focus:border-[#f0b44d] rounded p-2 text-xs text-[#e8edf2] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAskClaude()}
                  className="w-full py-1.5 bg-[#f0b44d] hover:bg-[#d99f3b] text-black font-bold text-xs rounded transition cursor-pointer"
                >
                  ASK AI COPILOT
                </button>
              </div>

              {aiAnswer && (
                <div className="p-3 bg-[#101419] border border-[#f0b44d]/40 rounded-lg text-xs space-y-1">
                  <span className="text-[#f0b44d] font-bold text-[10px] block">
                    POLICY BULLETIN:
                  </span>
                  <p className="text-[#e8edf2] leading-relaxed">{aiAnswer}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}