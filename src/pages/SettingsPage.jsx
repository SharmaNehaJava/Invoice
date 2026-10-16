import { useState } from "react";
import { Button, Card, CardHeader, Field, PageHeader, inputClass } from "../components/ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function TextField({ id, label, value, onChange, type = "text", placeholder, error, hint }) {
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`${inputClass} ${error ? "border-error" : ""}`}
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </Field>
  );
}

export default function SettingsPage({ settings, onSave, notify }) {
  const [form, setForm] = useState(settings);
  const [errors, setErrors] = useState({});

  const set = (section, key) => (value) => {
    setForm((f) => ({ ...f, [section]: { ...f[section], [key]: value } }));
    setErrors((e) => ({ ...e, [`${section}.${key}`]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.rep.name.trim()) next["rep.name"] = "Enter your name.";
    if (form.rep.email && !EMAIL_RE.test(form.rep.email)) next["rep.email"] = "Enter a valid email address.";
    if (form.manager.email && !EMAIL_RE.test(form.manager.email)) next["manager.email"] = "Enter a valid email address.";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSave(form);
    notify("Settings saved");
  };

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-3xl space-y-4">
      <PageHeader
        description="Who you are, who approves your quotes, and what goes on the quote PDF."
        action={
          <Button variant="primary" type="submit">
            Save settings
          </Button>
        }
      />

      <Card>
        <CardHeader title="You" subtitle="Shown on customer quotes and emails" />
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
          <TextField id="rep-name" label="Name" value={form.rep.name} onChange={set("rep", "name")} error={errors["rep.name"]} />
          <TextField
            id="rep-email"
            label="Email"
            type="email"
            value={form.rep.email}
            onChange={set("rep", "email")}
            placeholder="you@dealer.com"
            error={errors["rep.email"]}
            hint="Customers reply to this address"
          />
          <TextField id="rep-phone" label="Phone" type="tel" value={form.rep.phone} onChange={set("rep", "phone")} placeholder="250 555 0100" />
        </div>
      </Card>

      <Card>
        <CardHeader title="Sales manager" subtitle="Gets cost sheets for approval" />
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
          <TextField
            id="manager-name"
            label="Name"
            value={form.manager.name}
            onChange={set("manager", "name")}
            placeholder="Sales manager"
            hint="Leave blank to show “Sales manager”"
          />
          <TextField
            id="manager-email"
            label="Email"
            type="email"
            value={form.manager.email}
            onChange={set("manager", "email")}
            placeholder="manager@dealer.com"
            error={errors["manager.email"]}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Dealership" subtitle="Letterhead on the quote PDF" />
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
          <TextField id="company-name" label="Business name" value={form.company.name} onChange={set("company", "name")} />
          <TextField id="company-phone" label="Phone" type="tel" value={form.company.phone} onChange={set("company", "phone")} />
          <TextField id="company-address" label="Address" value={form.company.address} onChange={set("company", "address")} />
          <TextField id="company-website" label="Website" value={form.company.website} onChange={set("company", "website")} />
        </div>
      </Card>
    </form>
  );
}
