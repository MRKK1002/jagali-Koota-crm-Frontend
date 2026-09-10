/**
 * Shared Jagali Koota PDF branding.
 *
 * Colours are sampled directly from public/logo4.jpeg — oxblood maroon
 * rgb(110,32,28) on warm greige rgb(209,201,188). Used by every generated
 * document so they stay visually consistent.
 */

// ── Brand palette ──────────────────────────────────────────────────────────
export const MAROON = [110, 32, 28];
export const MAROON_DEEP = [78, 22, 19];
export const GREIGE = [209, 201, 188];
export const CREAM = [246, 243, 238];
export const INK = [48, 43, 41];
export const MUTED = [122, 116, 110];
export const HAIRLINE = [196, 186, 174];

export const PAGE_MARGIN = 14;
export const BAND_H = 34;

const LOGO_PATH = "/logo4.jpeg";

export const COMPANY_DETAILS = {
  name: "Jagali Koota",
  address: "Mysuru, Karnataka",
  phone: "",
  email: "",
  gstin: "",
};

// ── Logo (fetched once, cached for the session) ─────────────────────────────
let logoCache; // undefined = untried, false = unavailable, object = loaded

export const loadLogo = async () => {
  if (logoCache !== undefined) return logoCache;
  try {
    const res = await fetch(LOGO_PATH);
    if (!res.ok) throw new Error(`logo ${res.status}`);
    const blob = await res.blob();
    const dataUrl = await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
    const dims = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 4, h: 3 });
      img.src = dataUrl;
    });
    logoCache = { dataUrl, ...dims };
  } catch {
    logoCache = false; // fall back to a text lockup, don't retry every click
  }
  return logoCache;
};

// ── Formatting helpers ──────────────────────────────────────────────────────
// jsPDF's built-in fonts have no rupee glyph, so use "Rs." rather than render
// an empty box.
export const inr = (v) =>
  `Rs. ${(Number(v) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export const amountInWords = (num) => {
  const n = Math.floor(Math.abs(Number(num) || 0));
  if (n === 0) return "Zero Rupees Only";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
    "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy",
    "Eighty", "Ninety"];
  const two = (x) =>
    x < 20 ? ones[x] : `${tens[Math.floor(x / 10)]}${x % 10 ? " " + ones[x % 10] : ""}`;
  const three = (x) =>
    `${x >= 100 ? ones[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " : "") : ""}${
      x % 100 ? two(x % 100) : ""
    }`;
  const parts = [];
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;
  if (crore) parts.push(`${three(crore)} Crore`);
  if (lakh) parts.push(`${three(lakh)} Lakh`);
  if (thousand) parts.push(`${three(thousand)} Thousand`);
  if (rest) parts.push(three(rest));
  return `${parts.join(" ").replace(/\s+/g, " ").trim()} Rupees Only`;
};

/**
 * Draws the letterhead: greige band, logo, document title and a maroon
 * reference pill. The band is filled with the logo's own background colour so
 * the jpeg seams into it invisibly.
 *
 * Returns the y coordinate just below the band.
 */
export const drawLetterhead = (doc, { title, pill, logo }) => {
  const pageW = doc.internal.pageSize.getWidth();
  const M = PAGE_MARGIN;

  doc.setFillColor(...GREIGE);
  doc.rect(0, 0, pageW, BAND_H, "F");

  if (logo) {
    const boxW = 46;
    const boxH = BAND_H - 8;
    const scale = Math.min(boxW / logo.w, boxH / logo.h);
    const lw = logo.w * scale;
    const lh = logo.h * scale;
    doc.addImage(logo.dataUrl, "JPEG", M, (BAND_H - lh) / 2, lw, lh);
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

  doc.setTextColor(...MAROON);
  doc.setFont("times", "bold");
  // Shrink the title if it would collide with the logo box
  doc.setFontSize(24);
  let titleSize = 24;
  while (doc.getTextWidth(title) > pageW - M * 2 - 52 && titleSize > 14) {
    titleSize -= 1;
    doc.setFontSize(titleSize);
  }
  doc.text(title, pageW - M, 16, { align: "right" });

  if (pill) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    const pillW = doc.getTextWidth(pill) + 14;
    const pillX = pageW - M - pillW;
    doc.setFillColor(...MAROON);
    doc.roundedRect(pillX, 20, pillW, 8, 1.6, 1.6, "F");
    doc.setTextColor(255, 255, 255);
    doc.text(pill, pillX + pillW / 2, 25.4, { align: "center" });
  }

  doc.setFillColor(...MAROON);
  doc.rect(0, BAND_H, pageW, 2.2, "F");

  return BAND_H + 2.2;
};

/** Greige footer bar with a reference line and page numbers, on every page. */
export const drawFooter = (doc, reference) => {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = PAGE_MARGIN;
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
      `${COMPANY_DETAILS.name}  ·  ${reference}  ·  Generated ${new Date().toLocaleString("en-IN")}`,
      M,
      pageH - 4.4
    );
    doc.text(`Page ${p} of ${pages}`, pageW - M, pageH - 4.4, { align: "right" });
  }
};

/**
 * Draws a labelled info strip of equal cells with hairline dividers.
 * cells = [[label, value], ...]. Returns the y below the strip.
 */
export const drawMetaStrip = (doc, y, cells) => {
  const pageW = doc.internal.pageSize.getWidth();
  const M = PAGE_MARGIN;
  const h = 13;
  const cellW = (pageW - M * 2) / cells.length;
  doc.setFillColor(...CREAM);
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y, pageW - M * 2, h, 1.8, 1.8, "FD");
  cells.forEach(([label, value], i) => {
    const cx = M + cellW * i + 4;
    if (i > 0) {
      doc.setDrawColor(...HAIRLINE);
      doc.line(M + cellW * i, y + 2.5, M + cellW * i, y + h - 2.5);
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.4);
    doc.setTextColor(...MUTED);
    doc.text(label, cx, y + 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(doc.splitTextToSize(String(value ?? "—"), cellW - 7)[0] || "—", cx, y + 10.2);
  });
  return y + h;
};

/** Shared autoTable styling so every document's tables match. */
export const tableTheme = {
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
  margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
};

/** Signature rules, evenly spread. labels = ["Requested By", ...] */
export const drawSignatures = (doc, y, labels) => {
  const pageW = doc.internal.pageSize.getWidth();
  const M = PAGE_MARGIN;
  const slot = (pageW - M * 2) / labels.length;
  labels.forEach((label, i) => {
    const cx = M + slot * i;
    const lineW = Math.min(slot - 10, 58);
    doc.setDrawColor(...HAIRLINE);
    doc.setLineWidth(0.4);
    doc.line(cx, y, cx + lineW, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...MAROON);
    doc.text(label, cx, y + 4.6);
  });
  return y + 10;
};
