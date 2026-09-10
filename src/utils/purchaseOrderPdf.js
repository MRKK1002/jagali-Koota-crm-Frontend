/**
 * Vendor-facing Purchase Order PDF.
 *
 * Branded to the Jagali Koota wordmark: colours below are sampled directly from
 * public/logo4.jpeg — oxblood maroon rgb(110,32,28) on warm greige rgb(209,201,188).
 *
 * Deliberately EXCLUDES payment status, payment progress and GRN/invoice counts.
 * Those are internal tracking and must never appear on a document handed to a
 * supplier.
 *
 * Tax note: items[].amount is stored TAX-INCLUSIVE, so it is displayed in the
 * Amount column but never summed to derive a subtotal. Totals come from the
 * stored subtotal/tax/total and are only recomputed as a fallback.
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  MAROON,
  MAROON_DEEP,
  GREIGE,
  CREAM,
  INK,
  MUTED,
  HAIRLINE,
  COMPANY_DETAILS,
  loadLogo,
  fmtDate,
  amountInWords,
} from "./pdfBrand";

export { COMPANY_DETAILS, amountInWords };

/**
 * Resolve the supplier. po.supplierId may be a populated object, a bare id, or
 * absent — fall back to the suppliers list so the vendor block is never a
 * column of dashes. Field names match the supplier form: contact /
 * billingAddress / gst / pan.
 */
const resolveSupplier = (po, suppliers = []) => {
  const embedded =
    typeof po.supplierId === "object" && po.supplierId ? po.supplierId : {};
  const refId = String(embedded._id || po.supplierId || "");
  const fromList =
    suppliers.find((s) => String(s._id) === refId) ||
    suppliers.find(
      (s) =>
        po.supplierName &&
        String(s.name || "").toLowerCase() ===
          String(po.supplierName).toLowerCase()
    ) ||
    {};
  const s = { ...fromList, ...embedded };
  return {
    name: s.name || po.supplierName || "—",
    address: s.billingAddress || s.address || "",
    gst: s.gst || s.gstNumber || "",
    pan: s.pan || "",
    phone: s.contact || s.phone || s.contactNumber || "",
    email: s.email || "",
  };
};

/** Builds the document. Returns { doc, filename }. */
export const buildPurchaseOrderPdf = async (po, suppliers = []) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 14; // page margin
  const logo = await loadLogo();

  const supplier = resolveSupplier(po, suppliers);
  const branch =
    typeof po.branch === "object" && po.branch ? po.branch : {};
  const branchName = branch.name || "—";
  const branchAddress = branch.address || "";

  // ═══ Header band ═════════════════════════════════════════════════════════
  // The logo jpeg has a solid greige background, so the band is filled with
  // exactly that colour and the image seams into it invisibly.
  const bandH = 34;
  doc.setFillColor(...GREIGE);
  doc.rect(0, 0, pageW, bandH, "F");

  if (logo) {
    // Contain the logo inside a fixed box, preserving aspect ratio.
    const boxW = 46;
    const boxH = bandH - 8;
    const scale = Math.min(boxW / logo.w, boxH / logo.h);
    const lw = logo.w * scale;
    const lh = logo.h * scale;
    doc.addImage(logo.dataUrl, "JPEG", M, (bandH - lh) / 2, lw, lh);
  } else {
    doc.setTextColor(...MAROON);
    doc.setFont("times", "bold");
    doc.setFontSize(21);
    doc.text(COMPANY_DETAILS.name.toUpperCase(), M, 17);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text("M Y S U R U", M + 1, 23);
  }

  // Title block, right aligned
  doc.setTextColor(...MAROON);
  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.text("PURCHASE ORDER", pageW - M, 16, { align: "right" });

  // PO number pill
  const poNo = po.purchaseOrderId || "—";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const pillTextW = doc.getTextWidth(poNo);
  const pillW = pillTextW + 14;
  const pillH = 8;
  const pillX = pageW - M - pillW;
  doc.setFillColor(...MAROON);
  doc.roundedRect(pillX, 20, pillW, pillH, 1.6, 1.6, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(poNo, pillX + pillW / 2, 25.4, { align: "center" });

  // Crisp maroon edge under the band
  doc.setFillColor(...MAROON);
  doc.rect(0, bandH, pageW, 2.2, "F");

  // ═══ FROM / TO cards ═════════════════════════════════════════════════════
  const cardY = bandH + 10;
  const gap = 6;
  const cardW = (pageW - M * 2 - gap) / 2;
  const padX = 4.5;

  // Compose the two address blocks first so both cards can share a height.
  const fromLines = [
    { t: COMPANY_DETAILS.name, bold: true, size: 11 },
    ...(branchAddress
      ? [{ t: branchAddress, size: 8.2 }]
      : COMPANY_DETAILS.address
      ? [{ t: COMPANY_DETAILS.address, size: 8.2 }]
      : []),
    ...(COMPANY_DETAILS.phone ? [{ t: `Phone  ${COMPANY_DETAILS.phone}`, size: 8.2 }] : []),
    ...(COMPANY_DETAILS.email ? [{ t: `Email  ${COMPANY_DETAILS.email}`, size: 8.2 }] : []),
    ...(COMPANY_DETAILS.gstin ? [{ t: `GSTIN  ${COMPANY_DETAILS.gstin}`, size: 8.2 }] : []),
    { t: `Branch  ${branchName}`, size: 8.2 },
  ];

  const toLines = [
    { t: supplier.name, bold: true, size: 11 },
    ...(supplier.address ? [{ t: supplier.address, size: 8.2 }] : []),
    ...(supplier.phone ? [{ t: `Phone  ${supplier.phone}`, size: 8.2 }] : []),
    ...(supplier.email ? [{ t: `Email  ${supplier.email}`, size: 8.2 }] : []),
    ...(supplier.gst ? [{ t: `GSTIN  ${supplier.gst}`, size: 8.2 }] : []),
    ...(supplier.pan ? [{ t: `PAN  ${supplier.pan}`, size: 8.2 }] : []),
  ];

  // Measure a block's rendered height
  const measure = (lines) => {
    let h = 0;
    lines.forEach((l) => {
      doc.setFontSize(l.size);
      const wrapped = doc.splitTextToSize(String(l.t), cardW - padX * 2);
      h += wrapped.length * (l.size * 0.42) + 1.6;
    });
    return h;
  };
  const headerStripH = 7;
  const bodyH = Math.max(measure(fromLines), measure(toLines));
  const cardH = headerStripH + bodyH + 6;

  const drawCard = (x, label, lines) => {
    // Card shell
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...HAIRLINE);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, cardY, cardW, cardH, 2, 2, "FD");
    // Label strip
    doc.setFillColor(...MAROON);
    doc.roundedRect(x, cardY, cardW, headerStripH, 2, 2, "F");
    doc.rect(x, cardY + headerStripH - 2, cardW, 2, "F"); // square off the bottom
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.6);
    doc.text(label, x + padX, cardY + 4.9);

    let ty = cardY + headerStripH + 5;
    lines.forEach((l) => {
      doc.setFontSize(l.size);
      doc.setFont("helvetica", l.bold ? "bold" : "normal");
      doc.setTextColor(...(l.bold ? MAROON : l.muted ? MUTED : INK));
      const wrapped = doc.splitTextToSize(String(l.t), cardW - padX * 2);
      doc.text(wrapped, x + padX, ty);
      ty += wrapped.length * (l.size * 0.42) + 1.6;
    });
  };

  drawCard(M, "FROM  ·  BILL TO", fromLines);
  drawCard(M + cardW + gap, "TO  ·  VENDOR / SUPPLIER", toLines);

  // ═══ Meta strip ══════════════════════════════════════════════════════════
  const metaY = cardY + cardH + 7;
  const metaH = 13;
  const meta = [
    ["ORDER DATE", fmtDate(po.orderDate)],
    ["EXPECTED DELIVERY", fmtDate(po.deliveryDate)],
    ["INVOICE NO.", po.invoiceNumber || "—"],
    ["DELIVER TO", po.storeLocation?.name || po.storeType || branchName || "—"],
  ];
  const cellW = (pageW - M * 2) / meta.length;
  doc.setFillColor(...CREAM);
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, metaY, pageW - M * 2, metaH, 1.8, 1.8, "FD");
  meta.forEach(([label, value], i) => {
    const cx = M + cellW * i + 4;
    if (i > 0) {
      doc.setDrawColor(...HAIRLINE);
      doc.line(M + cellW * i, metaY + 2.5, M + cellW * i, metaY + metaH - 2.5);
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.4);
    doc.setTextColor(...MUTED);
    doc.text(label, cx, metaY + 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(doc.splitTextToSize(String(value), cellW - 7)[0], cx, metaY + 10.2);
  });

  // ═══ Line items ══════════════════════════════════════════════════════════
  // This PDF is handed to the shop / supplier as a pick list, so it carries only
  // WHAT to supply and HOW MUCH. Rate, tax and amounts are deliberately omitted —
  // pricing stays internal and is still shown everywhere in the app UI.
  const items = Array.isArray(po.items) ? po.items : [];
  const body = items.map((it, i) => {
    const qty = Number(it.quantity) || 0;
    const name =
      typeof it.name === "object" && it.name ? it.name.name || "—" : it.name || "—";
    return [
      String(i + 1),
      name,
      it.unit || "—",
      qty.toLocaleString("en-IN"),
    ];
  });

  autoTable(doc, {
    startY: metaY + metaH + 7,
    head: [["#", "Item Description", "Unit", "Qty"]],
    body: body.length
      ? body
      : [["—", "No items on this purchase order", "", ""]],
    theme: "plain",
    headStyles: {
      fillColor: MAROON,
      textColor: [255, 255, 255],
      fontSize: 8.2,
      fontStyle: "bold",
      halign: "center",
      cellPadding: { top: 3, bottom: 3, left: 2.5, right: 2.5 },
    },
    bodyStyles: {
      fontSize: 8.4,
      textColor: INK,
      cellPadding: { top: 2.8, bottom: 2.8, left: 2.5, right: 2.5 },
      lineColor: HAIRLINE,
      lineWidth: { bottom: 0.2 },
    },
    alternateRowStyles: { fillColor: CREAM },
    columnStyles: {
      0: { halign: "center", cellWidth: 11, textColor: MUTED },
      1: { halign: "left", fontStyle: "bold" },
      2: { halign: "center", cellWidth: 22, textColor: MUTED },
      3: { halign: "right", cellWidth: 26, fontStyle: "bold", textColor: MAROON },
    },
    margin: { left: M, right: M },
  });

  // ═══ Item / quantity summary ═════════════════════════════════════════════
  // No money totals: this is a supply list, not a commercial invoice.
  const totalQty = items.reduce((s, it) => s + (Number(it.quantity) || 0), 0);

  let y = (doc.lastAutoTable?.finalY || 150) + 8;

  // Page-break guard for the summary + signature block
  const needed = 40;
  if (y + needed > pageH - 12) {
    doc.addPage();
    y = 20;
  }

  const panelW = 82;
  const panelX = pageW - M - panelW;
  const rowH = 7;

  doc.setFillColor(...CREAM);
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.3);
  doc.roundedRect(panelX, y, panelW, rowH * 2 + 3, 1.8, 1.8, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.6);
  doc.setTextColor(...INK);
  doc.text("Total Items", panelX + 4, y + 5.4);
  doc.setFont("helvetica", "bold");
  doc.text(String(items.length), panelX + panelW - 4, y + 5.4, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text("Total Quantity", panelX + 4, y + 5.4 + rowH);
  doc.setFont("helvetica", "bold");
  doc.text(
    totalQty.toLocaleString("en-IN"),
    panelX + panelW - 4,
    y + 5.4 + rowH,
    { align: "right" }
  );

  const gtY = y + rowH * 2 + 4;

  // ═══ Signature ════════════════════════════════════════════════════════════
  // Notes, Terms & Conditions and all pricing are intentionally not printed.
  const sigY = Math.min(gtY + 24, pageH - 26);
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.4);
  doc.line(pageW - M - 62, sigY, pageW - M, sigY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...MAROON);
  doc.text("Authorised Signatory", pageW - M, sigY + 4.6, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(`for ${COMPANY_DETAILS.name}`, pageW - M, sigY + 9, { align: "right" });

  // ═══ Footer on every page ════════════════════════════════════════════════
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p += 1) {
    doc.setPage(p);
    doc.setFillColor(...GREIGE);
    doc.rect(0, pageH - 11, pageW, 11, "F");
    doc.setFillColor(...MAROON);
    doc.rect(0, pageH - 11, pageW, 1.4, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(...MAROON_DEEP);
    doc.text(
      `${COMPANY_DETAILS.name}  ·  ${poNo}  ·  Generated ${new Date().toLocaleString("en-IN")}`,
      M,
      pageH - 4.4
    );
    doc.text(`Page ${p} of ${pages}`, pageW - M, pageH - 4.4, { align: "right" });
  }

  const safeSupplier = String(supplier.name).replace(/[^\w-]+/g, "_").slice(0, 40);
  const filename = `${poNo}_${safeSupplier}.pdf`;
  return { doc, filename };
};

export const downloadPurchaseOrderPdf = async (po, suppliers = []) => {
  const { doc, filename } = await buildPurchaseOrderPdf(po, suppliers);
  doc.save(filename);
  return filename;
};

/**
 * Share via the native share sheet (WhatsApp / email on mobile and tablet).
 * Returns "shared" | "downloaded" so the caller can toast appropriately.
 */
export const sharePurchaseOrderPdf = async (po, suppliers = []) => {
  const { doc, filename } = await buildPurchaseOrderPdf(po, suppliers);
  const blob = doc.output("blob");
  const file = new File([blob], filename, { type: "application/pdf" });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: po.purchaseOrderId || "Purchase Order",
      text: `Purchase Order ${po.purchaseOrderId || ""}`.trim(),
    });
    return "shared";
  }
  doc.save(filename);
  return "downloaded";
};
