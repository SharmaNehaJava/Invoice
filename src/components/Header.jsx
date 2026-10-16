import { useEffect, useRef, useState } from "react";

const BRANCHES = [
  { id: "05", name: "05 · Nanaimo, BC" },
  { id: "02", name: "02 · Victoria, BC" },
  { id: "01", name: "01 · Vancouver, BC" },
];

const NAV_ITEMS = [
  "CRM SHEET",
  "CALENDAR",
  "JAKE INBOX",
  "COPY FEEDBACK LINK",
  "FEEDBACK REPLIES",
  "ASK CLAUDE",
];

function getFormattedTime() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date())
    .toUpperCase();
}

export default function Header({
  user,
  onSignOut,
  onSignIn,
  onNavigate,
}) {
  const [currentTime, setCurrentTime] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0].name);
  const [copyNotice, setCopyNotice] = useState("");

  const branchRef = useRef(null);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close menus on outside click or escape key
  useEffect(() => {
    function handlePointerDown(event) {
      if (branchRef.current && !branchRef.current.contains(event.target)) {
        setIsBranchOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsBranchOpen(false);
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Time update (every minute)
  useEffect(() => {
    const updateTime = () => setCurrentTime(getFormattedTime());
    updateTime();
    const timer = window.setInterval(updateTime, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  function toggleBranchMenu() {
    setIsBranchOpen((open) => !open);
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  }

  function toggleProfileMenu() {
    setIsProfileOpen((open) => !open);
    setIsBranchOpen(false);
    setIsMobileMenuOpen(false);
  }

  function toggleMobileMenu() {
    setIsMobileMenuOpen((open) => !open);
    setIsBranchOpen(false);
    setIsProfileOpen(false);
  }

  function handleNavigation(item) {
    setIsMobileMenuOpen(false);

    if (item === "COPY FEEDBACK LINK") {
      const link = "https://ccequipment.ca/feedback/demo-session-current";
      navigator.clipboard.writeText(link);
      setCopyNotice("Demo Feedback Link Copied!");
      setTimeout(() => setCopyNotice(""), 2200);
      return;
    }

    // Map each button to its modal
    const mapping = {
      "CRM SHEET": "crm",
      "CALENDAR": "calendar",
      "JAKE INBOX": "inbox",
      "FEEDBACK REPLIES": "replies",
      "ASK CLAUDE": "ai",
    };

    if (mapping[item]) {
      onNavigate?.(mapping[item]);
    }
  }

  const controlClass =
    "inline-flex min-h-9 sm:min-h-10 items-center justify-center gap-1.5 sm:gap-2 rounded-lg " +
    "border border-elevated bg-panel px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-text-muted " +
    "transition-colors hover:border-accent/60 hover:bg-panel-hover " +
    "hover:text-text-main focus-visible:outline-2 " +
    "focus-visible:outline-offset-2 focus-visible:outline-accent cursor-pointer";

  return (
    <header className="relative z-30 mb-4 border-b border-elevated bg-app px-3 py-2.5 sm:px-5 sm:py-3 select-none font-mono">
      {/* Top row: Brand, Branch selector, Clock and Account */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 sm:pb-3 border-b border-elevated/60">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          {/* Brand */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <div
              aria-hidden="true"
              className="flex size-8 sm:size-9 items-center justify-center rounded-lg border border-accent/50 bg-accent-subtle font-mono font-bold text-accent text-xs sm:text-sm shadow-[0_0_10px_rgba(240,180,77,0.15)]"
            >
              CC
            </div>
            <span className="text-xs sm:text-base font-semibold tracking-wide text-text-main font-sans">
              Equipment AI
            </span>
          </div>

          {/* Branch selector */}
          <div ref={branchRef} className="relative">
            <button
              type="button"
              className={`${controlClass} max-w-[140px] sm:max-w-none font-mono`}
              onClick={toggleBranchMenu}
              aria-expanded={isBranchOpen}
              aria-haspopup="menu"
              aria-controls="branch-menu"
            >
              <span className="truncate">{selectedBranch}</span>
              <span aria-hidden="true" className="text-[10px] sm:text-xs text-text-dim">
                {isBranchOpen ? "▴" : "▾"}
              </span>
            </button>

            {isBranchOpen && (
              <div
                id="branch-menu"
                role="menu"
                aria-label="Select branch"
                className="absolute left-0 top-full mt-1.5 w-52 sm:w-56 max-w-[calc(100vw-24px)] rounded-xl border border-elevated bg-panel p-1.5 shadow-2xl z-50 font-mono"
              >
                {BRANCHES.map((branch) => {
                  const isSelected = selectedBranch === branch.name;
                  return (
                    <button
                      key={branch.id}
                      type="button"
                      role="menuitemradio"
                      aria-checked={isSelected}
                      className={`flex min-h-9 sm:min-h-10 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-accent-subtle font-medium text-accent"
                          : "text-text-muted hover:bg-panel-hover hover:text-text-main"
                      }`}
                      onClick={() => {
                        setSelectedBranch(branch.name);
                        setIsBranchOpen(false);
                      }}
                    >
                      <span>{branch.name}</span>
                      {isSelected && <span aria-hidden="true">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right side: Toast Notice, Clock and Account */}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
          {copyNotice && (
            <span className="text-[10px] sm:text-xs text-status-success font-semibold bg-panel border border-status-success/30 px-2 py-0.5 rounded">
              {copyNotice}
            </span>
          )}

          <time
            className="hidden whitespace-nowrap font-mono text-xs text-text-dim md:block"
            aria-label="Current local date and time"
          >
            {currentTime}
          </time>

          {user ? (
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={toggleProfileMenu}
                className="flex size-8 sm:size-10 items-center justify-center rounded-full border border-accent/50 bg-accent-subtle font-mono font-semibold text-accent text-xs sm:text-sm transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent cursor-pointer"
                aria-label={`Account menu for ${user.name}`}
                aria-expanded={isProfileOpen}
                aria-haspopup="menu"
                aria-controls="profile-menu"
              >
                {user.name?.charAt(0)?.toUpperCase() ?? "U"}
              </button>

              {isProfileOpen && (
                <div
                  id="profile-menu"
                  role="menu"
                  aria-label="Account menu"
                  className="absolute right-0 top-full mt-1.5 w-52 sm:w-60 max-w-[calc(100vw-24px)] rounded-xl border border-elevated bg-panel p-2 shadow-2xl z-50 font-sans"
                >
                  <div className="border-b border-elevated px-3 py-2">
                    <p className="truncate text-xs sm:text-sm font-semibold text-text-main">
                      {user.name}
                    </p>
                    <p className="truncate text-[10px] sm:text-xs text-text-muted font-mono">
                      {user.email}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="menuitem"
                    className="mt-1 flex min-h-9 sm:min-h-10 w-full items-center rounded-lg px-3 py-2 text-left text-xs sm:text-sm text-status-error transition-colors hover:bg-elevated cursor-pointer"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onSignOut?.();
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              className="min-h-9 sm:min-h-10 rounded-lg border border-accent/50 bg-accent px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-app transition-colors hover:bg-accent-hover cursor-pointer"
            >
              Sign in
            </button>
          )}
        </div>
      </div>

      {/* ADAPTIVE ROW 2: Mobile Dropdown vs Desktop Pills */}

      {/* 1. Mobile-only Dropdown Button (< 640px) */}
      <div className="relative block sm:hidden pt-2.5" ref={mobileMenuRef}>
        <button
          type="button"
          onClick={toggleMobileMenu}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-elevated bg-panel text-xs font-semibold text-text-main hover:border-accent/60 transition cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span className="text-accent font-bold">⚡</span>
            <span>QUICK ACTIONS & TOOLS</span>
          </span>
          <span className="text-[10px] text-text-dim">
            {isMobileMenuOpen ? "▲" : "▼"}
          </span>
        </button>

        {isMobileMenuOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 rounded-xl border border-elevated bg-panel p-1.5 shadow-2xl z-40 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isHighlighted = item === "ASK CLAUDE";
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition cursor-pointer ${
                    isHighlighted
                      ? "bg-accent-subtle text-accent border border-accent/40"
                      : "text-text-muted hover:bg-elevated hover:text-text-main"
                  }`}
                >
                  <span>{item}</span>
                  <span className="text-[10px] text-text-dim">→</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Desktop-only Horizontal Nav Pills (>= 640px) */}
      <nav
        aria-label="Main navigation"
        className="hidden sm:flex items-center gap-2 pt-2.5 flex-wrap"
      >
        {NAV_ITEMS.map((item) => {
          const isHighlighted = item === "ASK CLAUDE";
          return (
            <button
              key={item}
              type="button"
              onClick={() => handleNavigation(item)}
              className={`min-h-9 shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                isHighlighted
                  ? "border-accent/60 bg-accent-subtle text-accent hover:bg-elevated hover:border-accent"
                  : "border-elevated bg-panel text-text-muted hover:border-accent/50 hover:bg-panel-hover hover:text-text-main"
              }`}
            >
              {item}
            </button>
          );
        })}
      </nav>
    </header>
  );
}