/**
 * Indent / Requisition exports — one indent at a time ("indent-wise").
 *
 * Two formats:
 *   - PDF   : a printable requisition slip, branded to the Jagali Koota logo
 *   - Excel : the same rows as a spreadsheet for anyone who wants to filter
 *
 * Quantities are shown exactly as stored. Approved / Issued render as "—" while
 * still pending rather than 0, so a pending indent is never mistaken for a
 * zero-quantity approval.
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  MAROON,
  MUTED,
  INK,
  CREAM,
  HAIRLINE,
  PAGE_MARGIN as M,
  COMPANY_DETAILS,
  loadLogo,
  drawLetterhead,
  drawFooter,
  drawMetaStrip,
  drawSignatures,
  fmtDate,
  tableTheme,
} from "./pdfBrand";

const qty = (v) => (v === null || v === undefined || v === "" ? "—" : String(v));

const itemRows = (indent) =>
  (indent.items || []).map((it, i) => [
    String(i + 1),
    typeof it.productName === "object" && it.productName
      ? it.productName.name || "—"
      : it.productName || "—",
    qty(it.requestedQuantity),
    qty(it.approvedQuantity),
    qty(it.issuedQuantity),
    it.requestedUnit || "—",
    it.notes || "—",
  ]);

const safeName = (indent) => {
  const dept = String(indent.department || "Indent").replace(/[^\w-]+/g, "_");
  return `${indent.indentNumber || "Indent"}_${dept}`.slice(0, 60);
};

/** Builds the indent PDF. Returns { doc, filename }. */
export const buildIndentPdf = async (indent) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const logo = await loadLogo();

  const ref = indent.indentNumber || "—";
  drawLetterhead(doc, { title: "MATERIAL INDENT", pill: ref, logo });

  // Meta strip 1 — who and where
  let y = drawMetaStrip(doc, 46, [
    ["DEPARTMENT", indent.department],
    ["BRANCH", indent.branch],
    ["RAISED BY", indent.raisedBy],
  ]);

  // Meta strip 2 — when and what state
  y = drawMetaStrip(doc, y + 4, [
    ["RAISED ON", fmtDate(indent.createdAt)],
    ["REQUIRED BY", indent.requiredDate ? fmtDate(indent.requiredDate) : "—"],
    ["PRIORITY", indent.priority || "Normal"],
    ["STATUS", indent.status || "—"],
    ["TOTAL ITEMS", (indent.items || []).length],
  ]);

  const rows = itemRows(indent);
  autoTable(doc, {
    ...tableTheme,
    startY: y + 7,
    head: [["#", "Material", "Requested", "Approved", "Issued", "Unit", "Notes"]],
    body: rows.length
      ? rows
      : [["—", "No items on this indent", "", "", "", "", ""]],
    columnStyles: {
      0: { halign: "center", cellWidth: 9, textColor: MUTED },
      1: { halign: "left", fontStyle: "bold" },
      2: { halign: "right", cellWidth: 24 },
      3: { halign: "right", cellWidth: 24 },
      4: { halign: "right", cellWidth: 22 },
      5: { halign: "center", cellWidth: 16, textColor: MUTED },
      6: { halign: "left", textColor: MUTED, fontSize: 7.6 },
    },
  });

  // Purpose / remarks, if the indent carries any
  let after = (doc.lastAutoTable?.finalY || 150) + 9;
  const remarks = [
    indent.purpose && `Purpose: ${indent.purpose}`,
    indent.remarks,
    indent.hodRemarks && `HOD: ${indent.hodRemarks}`,
    indent.storeRemarks && `Store: ${indent.storeRemarks}`,
  ]
    .filter(Boolean)
    .join("\n");
  if (remarks) {
    if (after > pageH - 44) {
      doc.addPage();
      after = 20;
    }
    const boxLines = doc.splitTextToSize(String(remarks), pageW - M * 2 - 9);
    const boxH = boxLines.length * 3.9 + 11;
    doc.setFillColor(...CREAM);
    doc.setDrawColor(...HAIRLINE);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, after, pageW - M * 2, boxH, 1.8, 1.8, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.6);
    doc.setTextColor(...MAROON);
    doc.text("REMARKS", M + 4, after + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    doc.setTextColor(...INK);
    doc.text(boxLines, M + 4, after + 9.6);
    after += boxH + 8;
  }

  // Three-way sign-off, which is how a requisition actually moves
  if (after > pageH - 32) {
    doc.addPage();
    after = 24;
  }
  drawSignatures(doc, Math.min(after + 12, pageH - 22), [
    "Requested By",
    "HOD Approval",
    "Store Issued By",
  ]);

  drawFooter(doc, ref);
  return { doc, filename: `${safeName(indent)}.pdf` };
};

export const downloadIndentPdf = async (indent) => {
  const { doc, filename } = await buildIndentPdf(indent);
  doc.save(filename);
  return filename;
};

/** Excel export of a single indent — header rows then the item table. */
export const downloadIndentExcel = (indent) => {
  const header = [
    [COMPANY_DETAILS.name, "", "", "MATERIAL INDENT"],
    [],
    ["Indent #", indent.indentNumber || "—", "", "Department", indent.department || "—"],
    ["Branch", indent.branch || "—", "", "Raised By", indent.raisedBy || "—"],
    ["Raised On", fmtDate(indent.createdAt), "", "Status", indent.status || "—"],
    [
      "Required By",
      indent.requiredDate ? fmtDate(indent.requiredDate) : "—",
      "",
      "Priority",
      indent.priority || "Normal",
    ],
    ["Total Items", (indent.items || []).length, "", "Purpose", indent.purpose || "—"],
    [],
    ["#", "Material", "Requested", "Approved", "Issued", "Unit", "Notes"],
  ];
  const rows = itemRows(indent);

  const ws = XLSX.utils.aoa_to_sheet([...header, ...rows]);
  ws["!cols"] = [
    { wch: 6 },
    { wch: 34 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 8 },
    { wch: 30 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Indent");
  const filename = `${safeName(indent)}.xlsx`;
  XLSX.writeFile(wb, filename);
  return filename;
};

/**
 * Share the indent PDF through the native share sheet, falling back to a
 * download where the Web Share API isn't available.
 * Returns "shared" | "downloaded".
 */
export const shareIndentPdf = async (indent) => {
  const { doc, filename } = await buildIndentPdf(indent);
  const blob = doc.output("blob");
  const file = new File([blob], filename, { type: "application/pdf" });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: indent.indentNumber || "Material Indent",
      text: `Material Indent ${indent.indentNumber || ""}`.trim(),
    });
    return "shared";
  }
  doc.save(filename);
  return "downloaded";
};
