import { useState, useEffect } from "react";

export default function Header({ user, onSignOut, onSignIn }) {
  const [currentTime, setCurrentTime] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("05 · Nanaimo, BC");

  // Keep live time updated
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };
      setCurrentTime(now.toLocaleString("en-US", options).toUpperCase());
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navPills = [
    "CRM SHEET",
    "CALENDAR",
    "JAKE INBOX",
    "COPY FEEDBACK LINK",
    "FEEDBACK REPLIES",
    "ASK CLAUDE",
  ];

  return (
    <header className="border-b border-[#23291d] bg-[#0c0f0a] px-4 py-3 mb-4 select-none font-mono">
      {/* ROW 1: Branding, Branch, Clock & User */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#1b2216]">
        {/* Left: CC Logo + Equipment AI + Branch Dropdown */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-[#b8c944] bg-[#161f10] flex items-center justify-center text-[#b8c944] font-black text-sm">
            CC
          </div>
          <span className="font-bold tracking-widest text-[#e2e8da] text-sm">
            Equipment AI
          </span>

          {/* Clean Branch Dropdown */}
          <div className="ml-2 flex items-center bg-[#121610] border border-[#23291d] px-2.5 py-1 rounded text-xs text-[#86957c]">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent text-[#cbd5c0] focus:outline-none cursor-pointer text-xs"
            >
              <option value="05 · Nanaimo, BC" className="bg-[#121610]">05 · Nanaimo, BC</option>
              <option value="02 · Victoria, BC" className="bg-[#121610]">02 · Victoria, BC</option>
              <option value="01 · Vancouver, BC" className="bg-[#121610]">01 · Vancouver, BC</option>
            </select>
          </div>
        </div>

        {/* Right: Live Time + User Avatar / Sign In */}
        <div className="flex items-center gap-4 text-xs">
          <div className="text-[#64725c] tracking-wider">
            {currentTime || "LOADING..."}
          </div>

          {/* User Auth Section */}
          {user ? (
            <div className="relative">
              {/* Circle with first letter */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-8 h-8 rounded-full border border-[#b8c944] bg-[#1a2312] text-[#b8c944] font-bold flex items-center justify-center text-xs hover:bg-[#243019] transition"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>

              {/* Minimal Dropdown: Name, Email & Sign Out */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#121610] border border-[#283221] rounded shadow-xl py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-[#1b2216]">
                    <p className="text-[#e2e8da] font-semibold text-xs">{user.name}</p>
                    <p className="text-[10px] text-[#55624e] truncate">{user.email}</p>
                  </div>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#b04a4a] hover:bg-[#1f1515] transition"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              className="px-3 py-1 rounded border border-[#b8c944] bg-[#1a2312] text-[#b8c944] text-xs font-bold hover:bg-[#253218] transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* ROW 2: Separate Line for Navigation Pills */}
      <div className="flex flex-wrap gap-2 pt-3">
        {navPills.map((pill) => {
          const isAskClaude = pill === "ASK CLAUDE";
          return (
            <button
              key={pill}
              type="button"
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                isAskClaude
                  ? "border-[#b8c944] text-[#b8c944] bg-[#1a2213] hover:bg-[#232e18]"
                  : "border-[#23291d] bg-[#121610] text-[#788570] hover:text-[#b8c944] hover:border-[#b8c944]"
              }`}
            >
              {pill}
            </button>
          );
        })}
      </div>
    </header>
  );
}