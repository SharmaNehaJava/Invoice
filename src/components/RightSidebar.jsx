export default function RightSidebar() {
  const schedule = [
    { time: "19:00", text: "Personal Growth" },
    { time: "21:00", text: "Rhino's Daily Review" },
    { time: "all day", text: "Follow up: Garden City Landscaping — Avant" },
    { time: "09:00", badge: "WED", text: "Demo: Bandit 90XP — Arbutus Ridge" },
  ];

  return (
    <aside className="space-y-4 font-mono text-xs">
      {/* 07 TODAY */}
      <div className="border border-[#23291d] bg-[#121610] p-3 rounded">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[#b8c944] font-bold">07 TODAY</span>
          <span className="text-[10px] text-[#4e5b47]">19:00</span>
        </div>
        <div className="divide-y divide-[#1b2216]">
          {schedule.map((item, idx) => (
            <div key={idx} className="py-1.5 flex gap-2 items-start text-[11px]">
              <span className="text-[#4e5b47] w-12 shrink-0">{item.time}</span>
              <span className="text-[#86957c]">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 08 MARGIN */}
      <div className="border border-[#23291d] bg-[#121610] p-3 rounded">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[#b8c944] font-bold">08 MARGIN</span>
          <span className="text-[10px] text-[#4e5b47]">PROVISIONAL</span>
        </div>
        <p className="text-[11px] text-[#6b7762]">Build a quote and the margin lands here.</p>
      </div>

      {/* 09 WATCH LIST */}
      <div className="border border-[#23291d] bg-[#121610] p-3 rounded">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[#b8c944] font-bold">09 WATCH LIST</span>
          <span className="text-[10px] text-[#4e5b47]">PAID FOR ONCE</span>
        </div>
        <div className="space-y-2 text-[11px] text-[#788570]">
          <p>
            <span className="text-[#b8c944]">Consignment:</span> Check commercial liability insurance at the start, not at funding.
          </p>
          <p>
            <span className="text-[#b8c944]">OEM Notice:</span> CE prices rose ~4% on 1 April 2026.
          </p>
        </div>
      </div>
    </aside>
  );
}