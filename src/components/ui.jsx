// Small shared building blocks so every page looks and behaves the same.

const cx = (...classes) => classes.filter(Boolean).join(" ");

export function Card({ className, children, ...props }) {
  return (
    <section
      className={cx("rounded-xl border border-line bg-panel shadow-sm", className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-text-main">{title}</h2>
        {subtitle && <p className="text-xs text-text-dim">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const BUTTON_VARIANTS = {
  primary: "bg-accent text-accent-ink hover:bg-accent-hover border-transparent font-semibold",
  secondary: "bg-panel text-text-main border-line-strong hover:bg-panel-hover",
  ghost: "bg-transparent text-text-muted border-transparent hover:bg-panel-hover hover:text-text-main",
  danger: "bg-transparent text-error border-transparent hover:bg-error-subtle",
};

const BUTTON_SIZES = {
  sm: "h-8 px-2.5 text-xs gap-1.5",
  md: "h-10 px-3.5 text-sm gap-2",
  lg: "h-11 px-4 text-sm gap-2",
};

export function Button({ variant = "secondary", size = "md", className, children, ...props }) {
  return (
    <button
      type="button"
      className={cx(
        "inline-flex items-center justify-center rounded-lg border font-medium transition-colors",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export const inputClass =
  "h-10 w-full rounded-lg border border-line-strong bg-panel px-3 text-sm text-text-main " +
  "placeholder:text-text-dim focus:border-accent focus:outline-none";

export function Field({ label, hint, htmlFor, className, children }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-text-muted">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-text-dim">{hint}</p>}
    </div>
  );
}

// Number input with a fixed prefix/suffix (e.g. "$" or "%").
export function NumberInput({ id, value, onChange, prefix, suffix, step = "any", min, className }) {
  return (
    <div
      className={cx(
        "flex h-10 items-center rounded-lg border border-line-strong bg-panel px-3 focus-within:border-accent",
        className
      )}
    >
      {prefix && <span className="mr-1 text-sm text-text-dim">{prefix}</span>}
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        // Select on focus so typing replaces the value instead of appending to "0".
        onFocus={(e) => e.target.select()}
        className="font-data w-full min-w-0 bg-transparent text-right text-sm text-text-main focus:outline-none"
      />
      {suffix && <span className="ml-1 text-sm text-text-dim">{suffix}</span>}
    </div>
  );
}

const BADGE_TONES = {
  neutral: "bg-subtle text-text-muted border-line",
  accent: "bg-accent-subtle text-accent-text border-accent/40",
  success: "bg-success-subtle text-success border-success/30",
  warning: "bg-warning-subtle text-warning border-warning/30",
  error: "bg-error-subtle text-error border-error/30",
  info: "bg-info-subtle text-info border-info/30",
};

export function Badge({ tone = "neutral", className, children }) {
  return (
    <span
      className={cx(
        "inline-flex items-center whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
        BADGE_TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

// The page title lives in the top bar; this row carries the context and main action.
export function PageHeader({ description, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      {description && <p className="text-sm text-text-muted">{description}</p>}
      {action}
    </div>
  );
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong px-6 py-10 text-center">
      <p className="text-sm font-medium text-text-main">{title}</p>
      {body && <p className="mt-1 text-sm text-text-muted">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Segmented control used for filters and small tab sets.
export function Segmented({ options, value, onChange, className }) {
  return (
    <div className={cx("inline-flex rounded-lg border border-line bg-subtle p-0.5", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cx(
            "h-8 whitespace-nowrap rounded-md px-3 text-xs font-medium transition-colors",
            value === opt.value
              ? "bg-panel text-text-main shadow-sm"
              : "text-text-muted hover:text-text-main"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
