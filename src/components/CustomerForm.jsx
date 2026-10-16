import { useState } from "react";
import { Button, Field, inputClass } from "./ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Used to add a customer and to edit one (e.g. when their email changes).
export default function CustomerForm({ initial, existingNames = [], submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState({ name: "", contact: "", phone: "", email: "", ...initial });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const next = {};
    if (!name) next.name = "Enter the company name.";
    else if (
      existingNames.some((n) => n.toLowerCase() === name.toLowerCase()) &&
      name.toLowerCase() !== (initial?.name ?? "").toLowerCase()
    ) {
      next.name = "A customer with this name already exists.";
    }
    if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email address.";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({ ...form, name, email: form.email.trim(), contact: form.contact.trim(), phone: form.phone.trim() });
  };

  const field = (key, label, props = {}) => (
    <Field label={label} htmlFor={`customer-${key}`}>
      <input
        id={`customer-${key}`}
        value={form[key]}
        onChange={set(key)}
        aria-invalid={Boolean(errors[key])}
        className={`${inputClass} ${errors[key] ? "border-error" : ""}`}
        {...props}
      />
      {errors[key] && <p className="mt-1 text-xs text-error">{errors[key]}</p>}
    </Field>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-3 p-4">
      {field("name", "Company", { placeholder: "RG Excavating" })}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {field("contact", "Contact person", { placeholder: "Jeff" })}
        {field("phone", "Phone", { type: "tel", placeholder: "250 555 0100" })}
      </div>
      {field("email", "Email", { type: "email", placeholder: "jeff@rgexcavating.ca" })}
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
