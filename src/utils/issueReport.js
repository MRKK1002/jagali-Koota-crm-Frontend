/**
 * Date-wise store-issue report.
 *
 * Consolidates every "Store Issued" indent within a date range into either a
 * material-wise or department-wise summary, and exports it as a branded PDF or
 * an Excel sheet.
 *
 * Which date? An indent is counted on the day the STORE ISSUED it, i.e.
 * storeApproval.approvedAt (set in RestaurantIndentController store-issue).
 * Older records that predate that field fall back to updatedAt. createdAt (when
 * the indent was raised) is deliberately NOT used — that's a request date, not
 * an issue date.
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  MAROON,
  MUTED,
  INK,
  COMPANY_DETAILS,
  loadLogo,
  drawLetterhead,
  drawFooter,
  drawMetaStrip,
  fmtDate,
  tableTheme,
} from "./pdfBrand";

// The timestamp an indent was actually issued on.
export const issuedAt = (indent) =>
  indent?.storeApproval?.approvedAt || indent?.updatedAt || null;

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

const matName = (it) =>
  typeof it.productName === "object" && it.productName
    ? it.productName.name || "—"
    : it.productName || "—";

/**
 * Select issued indents whose issue date falls within [from, to] (inclusive),
 * optionally filtered by branch. `from`/`to` are yyyy-mm-dd strings.
 */
export const filterIssuedIndents = (indents = [], { from, to, branch } = {}) => {
  const start = from ? new Date(`${from}T00:00:00`) : null;
  const end = to ? new Date(`${to}T23:59:59.999`) : null;
  return indents.filter((ind) => {
    if (ind.status !== "Store Issued" && ind.status !== "Completed") return false;
    if (branch && branch !== "all" && ind.branch !== branch) return false;
    const ts = issuedAt(ind);
    if (!ts) return false;
    const d = new Date(ts);
    if (start && d < start) return false;
    if (end && d > end) return false;
    return true;
  });
};

/** A line's issued quantity, falling back to approved then requested. */
const lineQty = (it) =>
  it.issuedQuantity != null
    ? num(it.issuedQuantity)
    : it.approvedQuantity != null
    ? num(it.approvedQuantity)
    : num(it.requestedQuantity);

/** Group issued lines by material across all selected indents. */
export const aggregateByMaterial = (indents) => {
  const map = new Map();
  indents.forEach((ind) => {
    (ind.items || []).forEach((it) => {
      const name = matName(it);
      const unit = it.requestedUnit || "—";
      const key = `${name}|||${unit}`;
      if (!map.has(key)) {
        map.set(key, { name, unit, qty: 0, depts: new Set(), indents: new Set() });
      }
      const row = map.get(key);
      row.qty += lineQty(it);
      row.depts.add(ind.department || "—");
      row.indents.add(ind.indentNumber);
    });
  });
  return [...map.values()]
    .map((r) => ({
      name: r.name,
      unit: r.unit,
      qty: r.qty,
      depts: [...r.depts].sort(),
      indentCount: r.indents.size,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

/** Group by department, then material within each department. */
export const aggregateByDepartment = (indents) => {
  const deptMap = new Map();
  indents.forEach((ind) => {
    const dept = ind.department || "—";
    if (!deptMap.has(dept)) {
      deptMap.set(dept, { dept, materials: new Map(), indents: new Set() });
    }
    const d = deptMap.get(dept);
    d.indents.add(ind.indentNumber);
    (ind.items || []).forEach((it) => {
      const name = matName(it);
      const unit = it.requestedUnit || "—";
      const key = `${name}|||${unit}`;
      if (!d.materials.has(key)) d.materials.set(key, { name, unit, qty: 0 });
      d.materials.get(key).qty += lineQty(it);
    });
  });
  return [...deptMap.values()]
    .map((d) => ({
      dept: d.dept,
      indentCount: d.indents.size,
      materials: [...d.materials.values()].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.dept.localeCompare(b.dept));
};

const rangeLabel = ({ from, to }) =>
  from && to
    ? from === to
      ? fmtDate(from)
      : `${fmtDate(from)}  to  ${fmtDate(to)}`
    : "All dates";

const fileStamp = ({ from, to }) =>
  from && to ? (from === to ? from : `${from}_to_${to}`) : "all";

// ── PDF ──────────────────────────────────────────────────────────────────
export const buildIssueReportPdf = async (indents, opts) => {
  const { from, to, branch, groupBy } = opts;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const logo = await loadLogo();
  const ref = `ISSUE ${fileStamp(opts)}`;

  const title = groupBy === "department" ? "STORE ISSUE — BY DEPT" : "STORE ISSUE REPORT";
  drawLetterhead(doc, { title, pill: null, logo });

  const totalLines = indents.reduce((s, i) => s + (i.items || []).length, 0);
  let y = drawMetaStrip(doc, 46, [
    ["PERIOD", rangeLabel(opts)],
    ["BRANCH", branch && branch !== "all" ? branch : "All branches"],
    ["INDENTS", indents.length],
    ["LINE ITEMS", totalLines],
  ]);

  if (indents.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text("No store issues found for this period.", 14, y + 14);
    drawFooter(doc, ref);
    return { doc, filename: `StoreIssue_${fileStamp(opts)}.pdf` };
  }

  if (groupBy === "department") {
    const groups = aggregateByDepartment(indents);
    let startY = y + 7;
    groups.forEach((g) => {
      autoTable(doc, {
        ...tableTheme,
        startY,
        head: [[`${g.dept}  (${g.indentCount} indent${g.indentCount === 1 ? "" : "s"})`, "Unit", "Issued Qty"]],
        body: g.materials.map((m) => [m.name, m.unit, m.qty.toLocaleString("en-IN")]),
        columnStyles: {
          0: { halign: "left", fontStyle: "bold" },
          1: { halign: "center", cellWidth: 24, textColor: MUTED },
          2: { halign: "right", cellWidth: 34, fontStyle: "bold", textColor: MAROON },
        },
      });
      startY = (doc.lastAutoTable?.finalY || startY) + 6;
    });
  } else {
    const rows = aggregateByMaterial(indents);
    autoTable(doc, {
      ...tableTheme,
      startY: y + 7,
      head: [["#", "Material", "Unit", "Total Issued", "Departments", "Indents"]],
      body: rows.map((r, i) => [
        String(i + 1),
        r.name,
        r.unit,
        r.qty.toLocaleString("en-IN"),
        r.depts.join(", "),
        String(r.indentCount),
      ]),
      columnStyles: {
        0: { halign: "center", cellWidth: 9, textColor: MUTED },
        1: { halign: "left", fontStyle: "bold" },
        2: { halign: "center", cellWidth: 15, textColor: MUTED },
        3: { halign: "right", cellWidth: 26, fontStyle: "bold", textColor: MAROON },
        4: { halign: "left", fontSize: 7.6, textColor: INK },
        5: { halign: "center", cellWidth: 15 },
      },
    });
  }

  drawFooter(doc, ref);
  return { doc, filename: `StoreIssue_${fileStamp(opts)}.pdf` };
};

export const downloadIssueReportPdf = async (indents, opts) => {
  const { doc, filename } = await buildIssueReportPdf(indents, opts);
  doc.save(filename);
  return filename;
};

// ── Excel ──────────────────────────────────────────────────────────────────
export const downloadIssueReportExcel = (indents, opts) => {
  const { groupBy } = opts;
  const wb = XLSX.utils.book_new();
  const head = [
    [COMPANY_DETAILS.name, "", "STORE ISSUE REPORT"],
    ["Period", rangeLabel(opts)],
    ["Branch", opts.branch && opts.branch !== "all" ? opts.branch : "All branches"],
    ["Indents", indents.length],
    [],
  ];

  if (groupBy === "department") {
    const groups = aggregateByDepartment(indents);
    const aoa = [...head, ["Department", "Material", "Unit", "Issued Qty"]];
    groups.forEach((g) => {
      g.materials.forEach((m, idx) => {
        aoa.push([idx === 0 ? `${g.dept} (${g.indentCount})` : "", m.name, m.unit, m.qty]);
      });
    });
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 22 }, { wch: 32 }, { wch: 8 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws, "By Department");
  } else {
    const rows = aggregateByMaterial(indents);
    const aoa = [
      ...head,
      ["#", "Material", "Unit", "Total Issued", "Departments", "Indents"],
      ...rows.map((r, i) => [i + 1, r.name, r.unit, r.qty, r.depts.join(", "), r.indentCount]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 6 }, { wch: 32 }, { wch: 8 }, { wch: 12 }, { wch: 40 }, { wch: 8 }];
    XLSX.utils.book_append_sheet(wb, ws, "By Material");
  }

  const filename = `StoreIssue_${fileStamp(opts)}.xlsx`;
  XLSX.writeFile(wb, filename);
  return filename;
};
