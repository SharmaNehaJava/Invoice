export default function LeftSidebar() {
  return (
    <aside className="space-y-4 text-xs font-mono">
      {/* 01 OPERATOR */}
      <div className="border border-[#23291d] bg-[#121610] p-3 rounded">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[#b8c944] font-bold">01 OPERATOR</span>
          <span className="text-[10px] bg-[#1b2215] text-[#b8c944] px-1.5 py-0.5 rounded border border-[#2b3523]">
            LIVE
          </span>
        </div>

        <div className="space-y-1.5 text-[#86957c]">
          <p><span className="text-[#4e5b47]">DESK:</span> CC Equipment, Nanaimo</p>
          <p><span className="text-[#4e5b47]">BRANDS:</span> Wacker Neuson · Avant · Bandit</p>
          <p><span className="text-[#4e5b47]">MANAGER:</span> Sheldon Schlesinger</p>
          <p><span className="text-[#4e5b47]">COORD:</span> Sim — sales coordinator</p>
        </div>

        <p className="mt-4 pt-3 border-t border-[#1c2217] text-[10px] text-[#55624e] leading-tight">
          Nothing here contacts a customer. Quotes are copied out for you to send yourself.
        </p>
      </div>

      {/* 02 PRICING METHOD */}
      <div className="border border-[#23291d] bg-[#121610] p-3 rounded flex justify-between items-center">
        <span className="text-[#b8c944] font-bold">02 PRICING METHOD</span>
        <button className="px-2 py-0.5 text-[10px] border border-[#2b3523] rounded bg-[#161d12] text-[#86957c]">
          SHOW
        </button>
      </div>

      {/* 03 FOLLOW-UPS */}
      <div className="border border-[#23291d] bg-[#121610] p-3 rounded">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[#b8c944] font-bold">03 FOLLOW-UPS</span>
          <div className="flex gap-1 text-[10px]">
            <span className="bg-[#b8c944] text-black font-bold px-1.5 py-0.5 rounded">DAY</span>
            <span className="border border-[#2b3523] px-1.5 py-0.5 rounded text-[#788570]">14 DAYS</span>
          </div>
        </div>
        <p className="text-[11px] text-[#55624e] italic">No tasks in the next fortnight.</p>
      </div>
    </aside>
  );
}