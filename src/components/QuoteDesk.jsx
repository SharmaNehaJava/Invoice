import { useState, useEffect } from "react";
import { CATALOG, YARD_INVENTORY } from "../data/mockData";

export default function QuoteDesk({ onSendToSheldon, loadedQuote }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(CATALOG[1]); // Default to DW50
  const [markupPercent, setMarkupPercent] = useState(20);
  const [freight, setFreight] = useState(2200);
  const [copiedNotice, setCopiedNotice] = useState("");

  // Populate desk when user loads a quote from CRM sheet
  useEffect(() => {
    if (loadedQuote) {
      const match = CATALOG.find((c) =>
        loadedQuote.machine?.toLowerCase().includes(c.name.toLowerCase())
      );
      if (match) {
        setSelectedItem(match);
        setFreight(match.defaultFreight);
      }
    }
  }, [loadedQuote]);

  // Search filtering
  const searchResults = searchTerm.trim()
    ? CATALOG.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleSelect = (item) => {
    setSelectedItem(item);
    setFreight(item.defaultFreight);
    setSearchTerm("");
  };

  // Pricing math
  const dealerCost = selectedItem
    ? selectedItem.listPrice * (1 - selectedItem.dealerDiscount)
    : 0;
  const totalBaseCost = selectedItem
    ? dealerCost + selectedItem.defaultPdi + Number(freight)
    : 0;
  const sellPrice = Math.round(totalBaseCost * (1 + markupPercent / 100));

  // Finance calculations (48-month loan estimate)
  const monthlyPayment = Math.round(sellPrice / 48);
  const dailyRate = (monthlyPayment / 30).toFixed(2);
  const hourlyRate = (dailyRate / 8).toFixed(2);

  // Filter physical yard inventory matching current model
  const matchingStock = selectedItem
    ? YARD_INVENTORY.filter(
        (stock) => stock.model.toUpperCase() === selectedItem.name.toUpperCase()
      )
    : [];

  // Clipboard copy for customer SMS
  const copyCustomerQuote = () => {
    const text = `Quote for ${selectedItem.description}:\nSell Price: $${sellPrice.toLocaleString()}\nEst. Payment: $${dailyRate}/day ($${hourlyRate}/hr) on finance terms.`;
    navigator.clipboard.writeText(text);
    setCopiedNotice("Copied SMS Quote!");
    setTimeout(() => setCopiedNotice(""), 2000);
  };

  return (
    <section className="space-y-4">
      {/* 04 QUOTE DESK CARD */}
      <div className="border border-elevated bg-panel p-4 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-accent">04</span>
            <span className="font-sans font-bold text-text-main tracking-wide">
              QUOTE DESK
            </span>
          </div>
          <span className="font-mono text-xs text-text-dim">
            {CATALOG.length} LINES
          </span>
        </div>

        {/* Search Field */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search catalog — model, description (e.g. DW50, DW30, Avant)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-app border border-elevated rounded-lg px-3.5 py-2.5 text-sm text-text-main placeholder-text-dim focus:outline-none focus:border-accent transition font-sans"
          />
          {searchResults.length > 0 && (
            <div className="absolute z-20 w-full mt-1.5 bg-panel border border-elevated rounded-lg shadow-2xl max-h-56 overflow-y-auto">
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="p-3 cursor-pointer hover:bg-elevated flex justify-between items-center border-b border-elevated/40 last:border-b-0 transition"
                >
                  <span className="text-xs text-text-main font-sans">{item.description}</span>
                  <span className="text-xs font-mono font-bold text-accent">
                    ${item.listPrice.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Equipment Line Item */}
        {selectedItem && (
          <div className="bg-app border border-elevated/80 p-3.5 rounded-lg space-y-3 mb-4">
            <div className="flex justify-between items-start border-b border-elevated pb-2.5">
              <span className="font-sans text-xs sm:text-sm font-semibold text-text-main">
                {selectedItem.description}
              </span>
              <span className="font-mono text-xs sm:text-sm text-text-muted font-bold whitespace-nowrap ml-2">
                List: ${selectedItem.listPrice.toLocaleString()}
              </span>
            </div>

            {/* Cost, PDI, Freight Grid */}
            <div className="grid grid-cols-3 gap-2.5 text-text-muted">
              <div>
                <span className="font-sans text-[11px] text-text-dim block uppercase">
                  Dealer Cost
                </span>
                <span className="font-mono text-xs sm:text-sm text-text-main font-semibold">
                  ${Math.round(dealerCost).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-sans text-[11px] text-text-dim block uppercase">
                  PDI
                </span>
                <span className="font-mono text-xs sm:text-sm text-text-main font-semibold">
                  ${selectedItem.defaultPdi}
                </span>
              </div>
              <div>
                <label className="font-sans text-[11px] text-text-dim block uppercase">
                  Freight
                </label>
                <input
                  type="number"
                  value={freight}
                  onChange={(e) => setFreight(Number(e.target.value))}
                  className="w-full bg-panel border border-elevated px-2 py-0.5 rounded text-xs sm:text-sm text-text-main font-mono focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            {/* Markup Buttons */}
            <div className="pt-2 border-t border-elevated flex flex-wrap items-center justify-between gap-2">
              <span className="font-sans text-xs text-text-dim uppercase font-semibold">
                Markup: <span className="font-mono text-text-main">{markupPercent}%</span>
              </span>
              <div className="flex gap-1.5 font-mono">
                {[15, 17, 20, 22, 25].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setMarkupPercent(rate)}
                    className={`px-2.5 py-1 rounded text-xs border transition cursor-pointer ${
                      markupPercent === rate
                        ? "bg-accent text-app font-bold border-accent"
                        : "border-elevated text-text-muted hover:border-accent hover:text-accent bg-panel"
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            {/* Sell Price & Finance Breakdown */}
            <div className="pt-2.5 flex justify-between items-end border-t border-elevated">
              <div>
                <span className="font-sans text-[11px] text-text-dim uppercase block">
                  Sell Price
                </span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-accent">
                  ${sellPrice.toLocaleString()}
                </span>
              </div>
              <div className="text-right font-mono text-xs text-text-muted">
                <div>${dailyRate} / day</div>
                <div className="text-accent font-semibold">${hourlyRate} / hr</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons: Customer Quote vs Sheldon Review */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-center">
          <button
            type="button"
            onClick={copyCustomerQuote}
            className="w-full sm:flex-1 py-2.5 rounded-lg bg-accent text-app font-sans font-bold text-xs uppercase tracking-wide hover:bg-accent-hover transition cursor-pointer"
          >
            Quote for Customer
          </button>

          <button
            type="button"
            onClick={() => {
              if (onSendToSheldon && selectedItem) {
                onSendToSheldon({
                  customer: "RG Excavating",
                  machineName: selectedItem.description,
                  markup: markupPercent,
                  sellPrice: sellPrice,
                });
              }
            }}
            className="w-full sm:flex-1 py-2.5 rounded-lg border border-accent/60 text-accent font-sans font-bold text-xs uppercase tracking-wide hover:bg-accent-subtle transition cursor-pointer"
          >
            Cost Sheet for Sheldon
          </button>
        </div>

        {copiedNotice && (
          <p className="text-center text-xs font-semibold text-status-success mt-2">
            {copiedNotice}
          </p>
        )}

        {/* Yard Inventory (On the Ground) */}
        <div className="mt-5 pt-3.5 border-t border-elevated">
          <span className="font-sans text-[11px] font-bold tracking-wider text-text-dim block mb-2 uppercase">
            On the Ground — Matches This Quote
          </span>
          {matchingStock.length > 0 ? (
            <div className="space-y-2">
              {matchingStock.map((stock) => (
                <div
                  key={stock.id}
                  className="border border-elevated bg-app p-2.5 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-accent">
                      {stock.year} {stock.model}
                    </span>
                    <span className="font-mono text-[10px] bg-accent-subtle text-accent border border-accent/30 px-1.5 py-0.5 rounded font-semibold">
                      {stock.status}
                    </span>
                  </div>
                  <div className="font-sans text-xs text-text-muted mt-1">
                    {stock.description}
                  </div>
                  <div className="font-mono text-[10px] text-text-dim mt-0.5">
                    {stock.serialNumber} · {stock.branch}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-sans text-xs text-text-dim italic">
              No physical units currently matching in yard.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}