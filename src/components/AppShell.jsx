import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Ellipsis,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";

import { NAV_ITEMS } from "../lib/nav";

// The first four get a tab on phones; the rest live under "More".
const MOBILE_PRIMARY = ["quote", "customers", "quotes", "calendar"];

const BRANCHES = ["05 · Nanaimo, BC", "02 · Victoria, BC", "01 · Vancouver, BC"];

function useDismiss(ref, onDismiss) {
  useEffect(() => {
    const onPointer = (e) => ref.current && !ref.current.contains(e.target) && onDismiss();
    const onKey = (e) => e.key === "Escape" && onDismiss();
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, onDismiss]);
}

function Sidebar({ route, onNavigate, badges }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-panel lg:flex print:hidden">
      <div className="flex h-14 items-center gap-2.5 border-b border-line px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-xs font-bold text-accent-ink">
          CC
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-text-main">CC Equipment</div>
          <div className="text-xs text-text-dim">Sales desk</div>
        </div>
      </div>

      <nav aria-label="Main" className="flex-1 space-y-0.5 p-2">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = route === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={active ? "page" : undefined}
              className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
                active
                  ? "bg-accent-subtle font-semibold text-accent-text"
                  : "text-text-muted hover:bg-panel-hover hover:text-text-main"
              }`}
            >
              <Icon size={18} aria-hidden="true" />
              <span className="flex-1 text-left">{label}</span>
              {badges[id] > 0 && (
                <span className="rounded-full bg-warning-subtle px-1.5 text-[11px] font-semibold text-warning">
                  {badges[id]}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <p className="border-t border-line p-4 text-xs leading-relaxed text-text-dim">
        Nothing here contacts a customer. Quotes are copied out for you to send yourself.
      </p>
    </aside>
  );
}

function BottomNav({ route, onNavigate }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  useDismiss(moreRef, () => setMoreOpen(false));

  const primary = NAV_ITEMS.filter((n) => MOBILE_PRIMARY.includes(n.id));
  const secondary = NAV_ITEMS.filter((n) => !MOBILE_PRIMARY.includes(n.id));
  const moreActive = secondary.some((n) => n.id === route);

  const tabClass = (active) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
      active ? "text-accent-text" : "text-text-dim"
    }`;

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-panel pb-[env(safe-area-inset-bottom)] lg:hidden print:hidden"
    >
      {primary.map(({ id, label, icon: Icon }) => (
        <button key={id} type="button" onClick={() => onNavigate(id)} className={tabClass(route === id)}>
          <Icon size={20} aria-hidden="true" />
          {label}
        </button>
      ))}

      <div ref={moreRef} className="relative flex flex-1">
        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          aria-expanded={moreOpen}
          className={tabClass(moreActive)}
        >
          <Ellipsis size={20} aria-hidden="true" />
          More
        </button>
        {moreOpen && (
          <div className="absolute bottom-full right-2 mb-2 w-48 rounded-xl border border-line bg-panel p-1.5 shadow-xl">
            {secondary.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  onNavigate(id);
                }}
                className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm ${
                  route === id ? "bg-accent-subtle text-accent-text" : "text-text-muted hover:bg-panel-hover"
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

function TopBar({ title, user, onSignIn, onSignOut, theme, onToggleTheme, branch, onBranchChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useDismiss(menuRef, () => setMenuOpen(false));

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-panel/95 px-4 backdrop-blur print:hidden">
      <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-xs font-bold text-accent-ink lg:hidden">
        CC
      </div>
      <h1 className="truncate text-base font-semibold text-text-main">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <label className="sr-only" htmlFor="branch">
          Branch
        </label>
        <div className="relative hidden sm:block">
          <select
            id="branch"
            value={branch}
            onChange={(e) => onBranchChange(e.target.value)}
            className="h-9 appearance-none rounded-lg border border-line bg-panel pl-3 pr-8 text-sm text-text-muted hover:bg-panel-hover focus:outline-none"
          >
            {BRANCHES.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <ChevronDown
            size={14}
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-dim"
          />
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="flex size-9 items-center justify-center rounded-lg border border-line text-text-muted hover:bg-panel-hover hover:text-text-main"
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {user ? (
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={`Account menu for ${user.name}`}
              aria-expanded={menuOpen}
              className="flex size-9 items-center justify-center rounded-full bg-accent-subtle text-sm font-semibold text-accent-text"
            >
              {user.name.charAt(0).toUpperCase()}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-line bg-panel p-1.5 shadow-xl">
                <div className="border-b border-line px-3 py-2">
                  <p className="truncate text-sm font-semibold text-text-main">{user.name}</p>
                  <p className="truncate text-xs text-text-dim">{user.email}</p>
                </div>
                <div className="px-3 py-2 sm:hidden">
                  <label htmlFor="branch-mobile" className="mb-1 block text-xs text-text-dim">
                    Branch
                  </label>
                  <select
                    id="branch-mobile"
                    value={branch}
                    onChange={(e) => onBranchChange(e.target.value)}
                    className="h-9 w-full rounded-lg border border-line bg-panel px-2 text-sm text-text-main"
                  >
                    {BRANCHES.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onSignOut();
                  }}
                  className="mt-1 flex h-10 w-full items-center gap-2 rounded-lg px-3 text-sm text-error hover:bg-error-subtle"
                >
                  <LogOut size={16} aria-hidden="true" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onSignIn}
            className="h-9 rounded-lg bg-accent px-3 text-sm font-semibold text-accent-ink hover:bg-accent-hover"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}

export default function AppShell({ route, onNavigate, badges, topBar, children }) {
  const current = NAV_ITEMS.find((n) => n.id === route);

  return (
    <div className="flex min-h-screen bg-app text-text-main">
      <Sidebar route={route} onNavigate={onNavigate} badges={badges} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={current?.label ?? ""} {...topBar} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-36 pt-4 sm:px-6 lg:pb-24 xl:pb-8 print:max-w-none print:p-0">{children}</main>
      </div>
      <BottomNav route={route} onNavigate={onNavigate} />
    </div>
  );
}
