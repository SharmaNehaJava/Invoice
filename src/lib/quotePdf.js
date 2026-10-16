import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { formatMoney, formatRate, lineLabel, toNumber } from "./pricing";
import { addDays, formatDay, todayISO } from "./dates";

// Brand colours for the printed quote (light paper, so fixed values).
const INK = [17, 24, 39];
const MUTED = [107, 114, 128];
const LINE = [227, 230, 235];
const ACCENT = [240, 180, 77];
const ACCENT_DARK = [138, 82, 8];
const PANEL = [247, 248, 250];

const PAGE = { width: 210, height: 297, margin: 16 };

function text(doc, value, x, y, { size = 10, color = INK, bold = false, align = "left" } = {}) {
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(size);
  doc.setTextColor(...color);
  doc.text(String(value ?? ""), x, y, { align });
}

function header(doc, { company, quoteNumber, issued, validUntil }) {
  const { width, margin } = PAGE;
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, width, 4, "F");

  text(doc, company.name || "Quote", margin, 20, { size: 20, bold: true });
  const contact = [company.address, company.phone, company.website].filter(Boolean).join("  ·  ");
  if (contact) text(doc, contact, margin, 26, { size: 9, color: MUTED });

  text(doc, "QUOTE", width - margin, 18, { size: 18, bold: true, color: ACCENT_DARK, align: "right" });
  text(doc, quoteNumber, width - margin, 24, { size: 10, bold: true, align: "right" });
  text(doc, `Issued ${issued}`, width - margin, 29, { size: 9, color: MUTED, align: "right" });
  text(doc, `Valid until ${validUntil}`, width - margin, 33.5, { size: 9, color: MUTED, align: "right" });

  doc.setDrawColor(...LINE);
  doc.line(margin, 39, width - margin, 39);
}

function parties(doc, { customer, rep }, y) {
  const { width, margin } = PAGE;
  const col = (width - margin * 2) / 2;

  const block = (x, label, lines) => {
    text(doc, label, x, y, { size: 8, bold: true, color: MUTED });
    lines.filter(Boolean).forEach((line, i) => text(doc, line, x, y + 6 + i * 5, { size: i === 0 ? 11 : 9.5, bold: i === 0 }));
  };

  block(margin, "PREPARED FOR", [customer.name || "—", customer.contact, customer.email, customer.phone]);
  block(margin + col, "PREPARED BY", [rep.name || "—", rep.email, rep.phone]);
  return y + 30;
}

function itemsTable(doc, { pricing, itemize }, y) {
  const showPrices = itemize && pricing.rows.length > 1;
  const head = [["#", "Description", "Part no.", "Qty", ...(showPrices ? ["Amount"] : [])]];
  const body = pricing.rows.map((row, i) => [
    i + 1,
    lineLabel(row.line) || "Item",
    row.line.partNumber || "",
    row.qty,
    ...(showPrices ? [formatMoney(row.sellPrice, 2)] : []),
  ]);

  autoTable(doc, {
    startY: y,
    head,
    body,
    margin: { left: PAGE.margin, right: PAGE.margin },
    theme: "plain",
    styles: { font: "helvetica", fontSize: 9.5, textColor: INK, cellPadding: { top: 3, bottom: 3, left: 2, right: 2 } },
    headStyles: { fontStyle: "bold", fontSize: 8, textColor: MUTED, fillColor: PANEL },
    columnStyles: {
      0: { cellWidth: 9, textColor: MUTED },
      2: { cellWidth: 32, textColor: MUTED },
      3: { cellWidth: 14, halign: "center" },
      ...(showPrices ? { 4: { cellWidth: 32, halign: "right" } } : {}),
    },
    didParseCell: (data) => {
      // Keep column headings aligned with their numbers.
      if (data.section === "head" && data.column.index === 3) data.cell.styles.halign = "center";
      if (data.section === "head" && data.column.index === 4) data.cell.styles.halign = "right";
    },
    didDrawCell: (data) => {
      if (data.section === "body") {
        doc.setDrawColor(...LINE);
        doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
      }
    },
  });
  return doc.lastAutoTable.finalY + 8;
}

function totals(doc, { pricing, draft }, y) {
  const { width, margin } = PAGE;
  const boxWidth = 80;
  const x = width - margin - boxWidth;
  const tradeIn = toNumber(draft.tradeIn);
  const rows = [["Equipment price", formatMoney(pricing.sellPrice, 2)]];
  if (tradeIn > 0) rows.push(["Less trade-in", `-${formatMoney(tradeIn, 2)}`]);

  rows.forEach(([label, value], i) => {
    text(doc, label, x, y + i * 6, { size: 9.5, color: MUTED });
    text(doc, value, width - margin, y + i * 6, { size: 9.5, align: "right" });
  });

  const totalY = y + rows.length * 6 + 2;
  doc.setFillColor(...PANEL);
  doc.roundedRect(x - 3, totalY - 5, boxWidth + 3, 11, 2, 2, "F");
  text(doc, "Total before tax", x, totalY + 2, { size: 10, bold: true });
  text(doc, formatMoney(pricing.sellPrice - tradeIn, 2), width - margin - 2, totalY + 2, { size: 12, bold: true, align: "right" });
  text(doc, "Includes PDI and freight. Applicable taxes extra.", width - margin, totalY + 11, {
    size: 8,
    color: MUTED,
    align: "right",
  });
  return totalY + 20;
}

function financeBox(doc, { finance, rate, programName, otherRates, draft }, y) {
  if (!(finance.monthly > 0)) return y;
  const { width, margin } = PAGE;
  const boxWidth = width - margin * 2;
  const lines = otherRates.filter((r) => r.monthly > 0);
  const height = 26 + lines.length * 5;

  doc.setDrawColor(...ACCENT);
  doc.setFillColor(253, 243, 225);
  doc.roundedRect(margin, y, boxWidth, height, 2, 2, "FD");

  text(doc, "FINANCING (ON APPROVED CREDIT)", margin + 5, y + 7, { size: 8, bold: true, color: ACCENT_DARK });
  text(doc, `${formatMoney(finance.monthly, 2)} / month`, margin + 5, y + 15, { size: 15, bold: true });
  const terms = [programName, formatRate(rate.ratePercent, rate.months)];
  if (toNumber(draft.downPayment) > 0) terms.push(`${formatMoney(draft.downPayment)} down`);
  text(doc, terms.join("  ·  "), margin + 5, y + 21, { size: 9, color: MUTED });

  text(doc, `${formatMoney(finance.daily, 2)} per working day`, width - margin - 5, y + 13, { size: 10, bold: true, align: "right" });
  text(doc, `${formatMoney(finance.hourly, 2)} per hour`, width - margin - 5, y + 19, { size: 9, color: MUTED, align: "right" });

  lines.forEach((r, i) =>
    text(doc, `Or ${formatMoney(r.monthly, 2)} / month at ${formatRate(r.ratePercent, r.months)}`, margin + 5, y + 27 + i * 5, {
      size: 9,
      color: MUTED,
    })
  );
  return y + height + 8;
}

function acceptance(doc, y) {
  const { width, height, margin } = PAGE;
  if (y > height - 50) {
    doc.addPage();
    y = 24;
  }
  const col = (width - margin * 2 - 10) / 2;
  text(doc, "ACCEPTED BY", margin, y, { size: 8, bold: true, color: MUTED });
  doc.setDrawColor(...LINE);
  doc.line(margin, y + 14, margin + col, y + 14);
  doc.line(margin + col + 10, y + 14, width - margin, y + 14);
  text(doc, "Signature", margin, y + 19, { size: 8, color: MUTED });
  text(doc, "Date", margin + col + 10, y + 19, { size: 8, color: MUTED });
}

function footer(doc, { company, rep }) {
  const { width, height, margin } = PAGE;
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p += 1) {
    doc.setPage(p);
    doc.setDrawColor(...LINE);
    doc.line(margin, height - 18, width - margin, height - 18);
    text(doc, "Prices in CAD and subject to availability. Financing subject to credit approval.", margin, height - 12, {
      size: 8,
      color: MUTED,
    });
    const contact = rep.email || rep.phone ? `Questions? ${[rep.name, rep.email, rep.phone].filter(Boolean).join(" · ")}` : company.name;
    text(doc, contact, margin, height - 7.5, { size: 8, color: MUTED });
    text(doc, `Page ${p} of ${pages}`, width - margin, height - 7.5, { size: 8, color: MUTED, align: "right" });
  }
}

export function buildQuotePdf({ draft, pricing, finance, rate, programName, otherRates = [], settings, customer }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const issuedISO = todayISO();
  const quoteNumber = draft.quoteId ?? "Draft";
  const company = settings.company;
  const rep = settings.rep;

  doc.setProperties({ title: `Quote ${quoteNumber} — ${customer.name || ""}`, author: rep.name, creator: company.name });

  header(doc, {
    company,
    quoteNumber,
    issued: formatDay(issuedISO),
    validUntil: formatDay(addDays(issuedISO, toNumber(company.validDays) || 30)),
  });
  let y = parties(doc, { customer, rep }, 50);
  y = itemsTable(doc, { pricing, itemize: draft.itemize }, y);
  y = totals(doc, { pricing, draft }, y);
  y = financeBox(doc, { finance, rate, programName, otherRates, draft }, y);
  acceptance(doc, y + 4);
  footer(doc, { company, rep });
  return doc;
}

export function quoteFileName(draft, customerName) {
  const safe = (s) => String(s || "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  return `Quote-${safe(draft.quoteId) || "Draft"}${customerName ? `-${safe(customerName)}` : ""}.pdf`;
}

// Base64 (no data: prefix) for email attachments.
export function pdfToBase64(doc) {
  return doc.output("datauristring").split(",")[1];
}
