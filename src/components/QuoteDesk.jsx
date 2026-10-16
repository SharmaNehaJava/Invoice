import { useState } from "react";
import { CATALOG, YARD_INVENTORY } from "../data/mockData";

export default function QuoteDesk({ onQuoteChange }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(CATALOG[1]); // Default to DW50
  const [markupPercent, setMarkupPercent] = useState(20);
  const [freight, setFreight] = useState(2200);
  const [copiedNotice, setCopiedNotice] = useState("");

  // Search filtering
  const searchResults = searchTerm.trim()
    ? CATALOG.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleSelect = (item) => {
    setSelectedItem(item);
    setFreight(item.defaultFreight);
    setSearchTerm("");
  };

  // Pricing calculations
  const dealerCost = selectedItem ? selectedItem.listPrice * (1 - selectedItem.dealerDiscount) : 0;
  const totalBaseCost = selectedItem ? dealerCost + selectedItem.defaultPdi + Number(freight) : 0;
  const sellPrice = Math.round(totalBaseCost * (1 + markupPercent / 100));

  // Finance calculations (48-month loan estimate)
  const monthlyPayment = Math.round(sellPrice / 48);
  const dailyRate = (monthlyPayment / 30).toFixed(2);
  const hourlyRate = (dailyRate / 8).toFixed(2);

  // Filter yard stock that matches current model
  const matchingStock = selectedItem
    ? YARD_INVENTORY.filter((stock) => stock.model.toUpperCase() === selectedItem.name.toUpperCase())
    : [];

  // Copy helpers
  const copyCustomerQuote = () => {
    const text = `Quote for ${selectedItem.description}:\nPrice: $${sellPrice.toLocaleString()}\nEst. Payment: $${dailyRate}/day ($${hourlyRate}/hr) on finance terms.`;
    navigator.clipboard.writeText(text);
    setCopiedNotice("Copied SMS Quote!");
    setTimeout(() => setCopiedNotice(""), 2000);
  };

  return (
    <section className="space-y-4 font-mono text-xs">
      {/* 04 QUOTE DESK */}
      <div className="border border-[#23291d] bg-[#121610] p-4 rounded">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[#b8c944] font-bold">04 QUOTE DESK</span>
          <span className="text-[#55624e]">{CATALOG.length} LINES</span>
        </div>

        {/* Search Field */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search catalog — model, description (e.g. DW50, DW30)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0d100c] border border-[#23291d] rounded px-3 py-2 text-[#d8dfcf] placeholder-[#4e5b47] focus:outline-none focus:border-[#b8c944]"
          />
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-[#141911] border border-[#2b3523] rounded shadow-lg max-h-48 overflow-y-auto">
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="p-2 cursor-pointer hover:bg-[#1f2719] flex justify-between text-[#cbd5c0]"
                >
                  <span>{item.description}</span>
                  <span className="text-[#b8c944]">${item.listPrice.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Line Item Details */}
        {selectedItem && (
          <div className="bg-[#0e110d] border border-[#1f2619] p-3 rounded space-y-3 mb-4">
            <div className="flex justify-between border-b border-[#1b2216] pb-2 text-[#b8c944] font-bold">
              <span>{selectedItem.description}</span>
              <span>List: ${selectedItem.listPrice.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[#86957c]">
              <div>
                <span className="text-[#4e5b47] block text-[10px]">DEALER COST</span>
                ${Math.round(dealerCost).toLocaleString()}
              </div>
              <div>
                <span className="text-[#4e5b47] block text-[10px]">PDI</span>
                ${selectedItem.defaultPdi}
              </div>
              <div>
                <label className="text-[#4e5b47] block text-[10px]">FACTORY FREIGHT</label>
                <input
                  type="number"
                  value={freight}
                  onChange={(e) => setFreight(Number(e.target.value))}
                  className="w-full bg-[#090b08] border border-[#202719] px-2 py-0.5 rounded text-[#d8dfcf]"
                />
              </div>
            </div>

            {/* Markup Selector */}
            <div className="pt-2 border-t border-[#1b2216] flex items-center justify-between">
              <span className="text-[#4e5b47]">MARKUP: {markupPercent}%</span>
              <div className="flex gap-1">
                {[15, 17, 20, 22, 25].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setMarkupPercent(rate)}
                    className={`px-2 py-0.5 rounded text-[10px] border ${
                      markupPercent === rate
                        ? "bg-[#b8c944] text-black font-bold border-[#b8c944]"
                        : "border-[#2b3523] text-[#788570] hover:text-[#b8c944]"
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Results */}
            <div className="pt-2 flex justify-between items-end border-t border-[#1b2216]">
              <div>
                <span className="text-[10px] text-[#4e5b47] block">SELL PRICE</span>
                <span className="text-base font-bold text-[#b8c944]">
                  ${sellPrice.toLocaleString()}
                </span>
              </div>
              <div className="text-right text-[11px] text-[#86957c]">
                <div>${dailyRate} / day</div>
                <div className="text-[#b8c944] font-semibold">${hourlyRate} / hr</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={copyCustomerQuote}
            className="flex-1 py-1.5 rounded bg-[#b8c944] text-black font-bold text-xs hover:bg-[#a6b63a] transition"
          >
            QUOTE FOR CUSTOMER
          </button>
          {copiedNotice && <span className="text-[11px] text-[#b8c944]">{copiedNotice}</span>}
        </div>

        {/* Physical Stock (On the Ground) */}
        <div className="mt-4 pt-3 border-t border-[#1b2216]">
          <span className="text-[10px] tracking-wider text-[#4e5b47] block mb-2 font-bold">
            ON THE GROUND — MATCHES THIS QUOTE
          </span>
          {matchingStock.length > 0 ? (
            <div className="space-y-2">
              {matchingStock.map((stock) => (
                <div key={stock.id} className="border border-[#1f2719] bg-[#0c0f0a] p-2 rounded">
                  <div className="flex justify-between items-center text-[#b8c944]">
                    <span className="font-bold">{stock.year} {stock.model}</span>
                    <span className="text-[10px] bg-[#1a2314] px-1 py-0.5 rounded border border-[#2b3523]">
                      {stock.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#788570] mt-1">{stock.description}</div>
                  <div className="text-[10px] text-[#4e5b47]">{stock.serialNumber} · {stock.branch}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#55624e] italic">No physical units matching in dealership yard.</p>
          )}
        </div>
      </div>
    </section>
  );
}