import { useState } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge, Button, Card, CardHeader, EmptyState, Field, PageHeader, inputClass } from "../components/ui";
import FollowUps from "../components/FollowUps";

const EVENT_TYPES = { DEMO: "Demo", DELIVERY: "Delivery", "FOLLOW-UP": "Follow-up" };
const EVENT_STATUSES = {
  SCHEDULED: { label: "Scheduled", tone: "info" },
  "IN PROGRESS": { label: "In progress", tone: "warning" },
  COMPLETED: { label: "Completed", tone: "success" },
  POSTPONED: { label: "Postponed", tone: "neutral" },
};

const EMPTY_EVENT = {
  title: "",
  customer: "",
  time: "09:00 WED",
  type: "DEMO",
  status: "SCHEDULED",
  location: "",
};

function EventForm({ initial, customers, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setError("");
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.customer.trim()) {
      setError("Add a title and a customer.");
      return;
    }
    onSave(form);
  };

  return (
    <Card className="mb-4">
      <CardHeader title={initial.id ? "Edit event" : "New event"} />
      <form onSubmit={submit} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        <Field label="Title" htmlFor="ev-title" className="sm:col-span-2">
          <input id="ev-title" value={form.title} onChange={set("title")} className={inputClass} placeholder="Demo: DW30 wheel dumper" autoFocus />
        </Field>
        <Field label="Customer" htmlFor="ev-customer">
          <input id="ev-customer" list="ev-customers" value={form.customer} onChange={set("customer")} className={inputClass} placeholder="RG Excavating" />
          <datalist id="ev-customers">
            {customers.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
        </Field>
        <Field label="When" htmlFor="ev-time">
          <input id="ev-time" value={form.time} onChange={set("time")} className={inputClass} placeholder="09:00 WED" />
        </Field>
        <Field label="Type" htmlFor="ev-type">
          <select id="ev-type" value={form.type} onChange={set("type")} className={inputClass}>
            {Object.entries(EVENT_TYPES).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" htmlFor="ev-status">
          <select id="ev-status" value={form.status} onChange={set("status")} className={inputClass}>
            {Object.entries(EVENT_STATUSES).map(([v, s]) => (
              <option key={v} value={v}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Location" htmlFor="ev-location" className="sm:col-span-2">
          <input id="ev-location" value={form.location} onChange={set("location")} className={inputClass} placeholder="Customer job site" />
        </Field>
        {error && <p className="text-sm text-error sm:col-span-2">{error}</p>}
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {initial.id ? "Save changes" : "Add event"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function CalendarPage({
  events,
  customers,
  activities,
  onAdd,
  onUpdate,
  onDelete,
  onToggleActivity,
  onOpenCustomer,
}) {
  const [editing, setEditing] = useState(null);

  return (
    <div>
      <PageHeader
        description="Demos, deliveries and follow-ups."
        action={
          !editing && (
            <Button variant="primary" onClick={() => setEditing(EMPTY_EVENT)}>
              <Plus size={16} aria-hidden="true" />
              Add event
            </Button>
          )
        }
      />

      <FollowUps activities={activities} onToggleDone={onToggleActivity} onOpenCustomer={onOpenCustomer} />

      {editing && (
        <EventForm
          key={editing.id ?? "new"}
          initial={editing}
          customers={customers}
          onCancel={() => setEditing(null)}
          onSave={(form) => {
            if (form.id) onUpdate(form);
            else onAdd({ ...form, id: `EV-${Date.now()}` });
            setEditing(null);
          }}
        />
      )}

      {events.length ? (
        <Card>
          <ul className="divide-y divide-line">
            {events.map((ev) => {
              return (
                <li key={ev.id} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${ev.status === "COMPLETED" ? "opacity-60" : ""}`}>
                  <div className="font-data w-24 shrink-0 text-sm font-medium text-text-main">{ev.time}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-text-main">{ev.title}</span>
                      <Badge>{EVENT_TYPES[ev.type] ?? ev.type}</Badge>
                    </div>
                    <p className="flex items-center gap-1 text-xs text-text-dim">
                      <MapPin size={12} aria-hidden="true" />
                      {[ev.location, ev.customer].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <label htmlFor={`ev-status-${ev.id}`} className="sr-only">
                    Status
                  </label>
                  <select
                    id={`ev-status-${ev.id}`}
                    value={ev.status ?? "SCHEDULED"}
                    onChange={(e) => onUpdate({ ...ev, status: e.target.value })}
                    className="h-8 rounded-lg border border-line-strong bg-panel px-2 text-xs text-text-main"
                  >
                    {Object.entries(EVENT_STATUSES).map(([v, s]) => (
                      <option key={v} value={v}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <Button variant="ghost" size="sm" aria-label={`Edit ${ev.title}`} onClick={() => setEditing(ev)} className="w-8 px-0">
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    aria-label={`Delete ${ev.title}`}
                    onClick={() => window.confirm(`Delete “${ev.title}”?`) && onDelete(ev.id)}
                    className="w-8 px-0"
                  >
                    <Trash2 size={14} />
                  </Button>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : (
        <EmptyState title="Nothing on the calendar" body="Add demos, deliveries and follow-up calls to keep track of them." />
      )}
    </div>
  );
}
