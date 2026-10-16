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
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0].name);
  const [copyNotice, setCopyNotice] = useState("");

  const branchRef = useRef(null);
  const profileRef = useRef(null);

  // Close menus on outside click or escape key
  useEffect(() => {
    function handlePointerDown(event) {
      if (branchRef.current && !branchRef.current.contains(event.target)) {
        setIsBranchOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsBranchOpen(false);
        setIsProfileOpen(false);
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
  }

  function toggleProfileMenu() {
    setIsProfileOpen((open) => !open);
    setIsBranchOpen(false);
  }

  function handleNavigation(item) {
    if (item === "COPY FEEDBACK LINK") {
      const link = "https://ccequipment.ca/feedback/demo-session-current";
      navigator.clipboard.writeText(link);
      setCopyNotice("Demo Feedback Link Copied!");
      setTimeout(() => setCopyNotice(""), 2200);
      return;
    }

    // Map each button to its drawer
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
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg " +
    "border border-elevated bg-panel px-3 py-2 text-xs sm:text-sm text-text-muted " +
    "transition-colors hover:border-accent/60 hover:bg-panel-hover " +
    "hover:text-text-main focus-visible:outline-2 " +
    "focus-visible:outline-offset-2 focus-visible:outline-accent cursor-pointer";

  return (
    <header className="relative z-30 mb-4 border-b border-elevated bg-app px-3 py-3 sm:px-5">
      {/* Top row: Brand, Branch selector, Clock and Account */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-elevated/60">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          {/* Brand */}
          <div className="flex shrink-0 items-center gap-2.5">
            <div
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-lg border border-accent/50 bg-accent-subtle font-mono font-bold text-accent shadow-[0_0_10px_rgba(240,180,77,0.15)]"
            >
              CC
            </div>
            <span className="text-sm font-semibold tracking-wide text-text-main sm:text-base font-sans">
              Equipment AI
            </span>
          </div>

          {/* Branch selector */}
          <div ref={branchRef} className="relative">
            <button
              type="button"
              className={`${controlClass} max-w-full font-mono`}
              onClick={toggleBranchMenu}
              aria-expanded={isBranchOpen}
              aria-haspopup="menu"
              aria-controls="branch-menu"
            >
              <span className="max-w-[145px] truncate sm:max-w-none">
                {selectedBranch}
              </span>
              <span aria-hidden="true" className="text-xs text-text-dim">
                {isBranchOpen ? "▴" : "▾"}
              </span>
            </button>

            {isBranchOpen && (
              <div
                id="branch-menu"
                role="menu"
                aria-label="Select branch"
                className="absolute left-0 top-full mt-2 w-56 max-w-[calc(100vw-24px)] rounded-xl border border-elevated bg-panel p-1.5 shadow-2xl z-50 font-mono"
              >
                {BRANCHES.map((branch) => {
                  const isSelected = selectedBranch === branch.name;
                  return (
                    <button
                      key={branch.id}
                      type="button"
                      role="menuitemradio"
                      aria-checked={isSelected}
                      className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
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
            <span className="text-xs text-status-success font-semibold bg-panel border border-status-success/30 px-2.5 py-1 rounded">
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
                className="flex size-10 items-center justify-center rounded-full border border-accent/50 bg-accent-subtle font-mono font-semibold text-accent transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent cursor-pointer"
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
                  className="absolute right-0 top-full mt-2 w-60 max-w-[calc(100vw-24px)] rounded-xl border border-elevated bg-panel p-2 shadow-2xl z-50 font-sans"
                >
                  <div className="border-b border-elevated px-3 py-2">
                    <p className="truncate text-sm font-semibold text-text-main">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-text-muted font-mono">
                      {user.email}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="menuitem"
                    className="mt-1 flex min-h-10 w-full items-center rounded-lg px-3 py-2 text-left text-sm text-status-error transition-colors hover:bg-elevated cursor-pointer"
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
              className="min-h-10 rounded-lg border border-accent/50 bg-accent px-4 py-2 text-sm font-semibold text-app transition-colors hover:bg-accent-hover cursor-pointer"
            >
              Sign in
            </button>
          )}
        </div>
      </div>

      {/* Navigation Pills: Mobile scrollable */}
      <nav
        aria-label="Main navigation"
        className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pt-2.5 pb-0.5 whitespace-nowrap"
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