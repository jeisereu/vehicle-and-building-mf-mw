"use client";

import JSZip from "jszip";

export type ExportChecklistItem = {
  id: string;
  name: string;
};

export type ExportStatus = "pass" | "fail";

function formatTimeDisplay(value: string) {
  if (!value) return "Select time";
  const [rawHour, minute] = value.split(":").map(Number);
  const period = rawHour >= 12 ? "PM" : "AM";
  const hour = rawHour % 12 || 12;
  return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
}

export function exportVehicleMaintenancePdf() {
  window.print();
}

export async function exportVehicleMaintenanceExcel({
  statuses,
  leftItems,
  rightItems,
}: {
  statuses: Record<string, ExportStatus>;
  leftItems: ExportChecklistItem[];
  rightItems: ExportChecklistItem[];
}) {
  const form = document.querySelector<HTMLFormElement>(".checklist-form");
  if (!form) return;
  const formData = new FormData(form);
  const templateResponse = await fetch("/vehicle-maintenance-template.xlsx");
  if (!templateResponse.ok) throw new Error("The Excel template could not be loaded.");

  const zip = await JSZip.loadAsync(await templateResponse.arrayBuffer());
  const sheetFile = zip.file("xl/worksheets/sheet3.xml");
  if (!sheetFile) throw new Error("The Excel template form sheet is missing.");

  const sheetDocument = new DOMParser().parseFromString(await sheetFile.async("string"), "application/xml");
  const spreadsheetNamespace = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
  const findCell = (reference: string) => Array.from(sheetDocument.getElementsByTagNameNS(spreadsheetNamespace, "c")).find((cell) => cell.getAttribute("r") === reference);
  const setTextCell = (reference: string, value: string) => {
    const cell = findCell(reference);
    if (!cell) return;
    cell.removeAttribute("t");
    cell.replaceChildren();
    if (value) {
      cell.setAttribute("t", "inlineStr");
      const inlineString = sheetDocument.createElementNS(spreadsheetNamespace, "is");
      const text = sheetDocument.createElementNS(spreadsheetNamespace, "t");
      text.textContent = value;
      inlineString.append(text);
      cell.append(inlineString);
    }
  };
  const setNumberCell = (reference: string, value: number | undefined) => {
    const cell = findCell(reference);
    if (!cell) return;
    cell.removeAttribute("t");
    cell.replaceChildren();
    if (value !== undefined) {
      const numericValue = sheetDocument.createElementNS(spreadsheetNamespace, "v");
      numericValue.textContent = String(value);
      cell.append(numericValue);
    }
  };

  setTextCell("B7", String(formData.get("vehicle-type") || ""));
  setTextCell("J7", String(formData.get("driver") || ""));
  setTextCell("B9", String(formData.get("plate-number") || ""));
  setTextCell("J82", String(formData.get("inspected-by") || ""));

  const date = String(formData.get("inspection-date") || "");
  const time = String(formData.get("inspection-time") || "");
  if (date && time) {
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    const excelSerial = (Date.UTC(year, month - 1, day, hour, minute) - Date.UTC(1899, 11, 30)) / 86400000;
    setNumberCell("J9", excelSerial);
  } else {
    setTextCell("J9", `${date} ${formatTimeDisplay(time)}`.trim());
  }

  const setChecklistRow = (item: ExportChecklistItem | undefined, row: number, passColumn: string, failColumn: string, findingColumn: string) => {
    if (!item) return;
    setTextCell(`${passColumn}${row}`, statuses[item.id] === "pass" ? "✓" : "");
    setTextCell(`${failColumn}${row}`, statuses[item.id] === "fail" ? "✓" : "");
    setTextCell(`${findingColumn}${row}`, String(formData.get(`finding-${item.id}`) || ""));
  };

  const stylesFile = zip.file("xl/styles.xml");
  const workbookFile = zip.file("xl/workbook.xml");
  const workbookRelationshipsFile = zip.file("xl/_rels/workbook.xml.rels");
  const contentTypesFile = zip.file("[Content_Types].xml");
  if (!stylesFile || !workbookFile || !workbookRelationshipsFile || !contentTypesFile) throw new Error("The Excel template package is incomplete.");

  const stylesDocument = new DOMParser().parseFromString(await stylesFile.async("string"), "application/xml");
  const cellXfs = stylesDocument.getElementsByTagNameNS(spreadsheetNamespace, "cellXfs")[0];
  const wrappedStyles = new Map<number, number>();
  const getWrappedStyle = (styleIndex: number) => {
    const existingStyle = wrappedStyles.get(styleIndex);
    if (existingStyle !== undefined) return existingStyle;
    const sourceStyle = cellXfs.children[styleIndex];
    const wrappedStyle = sourceStyle.cloneNode(true) as Element;
    let alignment = wrappedStyle.getElementsByTagNameNS(spreadsheetNamespace, "alignment")[0];
    if (!alignment) {
      alignment = stylesDocument.createElementNS(spreadsheetNamespace, "alignment");
      wrappedStyle.append(alignment);
    }
    alignment.setAttribute("wrapText", "1");
    alignment.setAttribute("vertical", "center");
    cellXfs.append(wrappedStyle);
    const newStyleIndex = cellXfs.children.length - 1;
    wrappedStyles.set(styleIndex, newStyleIndex);
    return newStyleIndex;
  };
  const wrapItemCell = (reference: string, item?: ExportChecklistItem) => {
    if (!item || item.name.length < 22) return;
    const cell = findCell(reference);
    if (cell) cell.setAttribute("s", String(getWrappedStyle(Number(cell.getAttribute("s") || 0))));
  };
  const setItemRowHeight = (rowNumber: number, items: Array<ExportChecklistItem | undefined>) => {
    if (!items.some((item) => item && item.name.length >= 22)) return;
    const row = Array.from(sheetDocument.getElementsByTagNameNS(spreadsheetNamespace, "row")).find((candidate) => candidate.getAttribute("r") === String(rowNumber));
    if (row) {
      row.setAttribute("ht", "30");
      row.setAttribute("customHeight", "1");
    }
  };

  Array.from({ length: Math.max(leftItems.length, rightItems.length) }, (_, index) => {
    const leftRow = 14 + index * 2;
    const rightRow = leftRow + (index >= 21 ? 2 : 0);
    setChecklistRow(leftItems[index], leftRow, "C", "E", "G");
    setChecklistRow(rightItems[index], rightRow, "K", "M", "O");
    wrapItemCell(`A${leftRow}`, leftItems[index]);
    wrapItemCell(`I${rightRow}`, rightItems[index]);
    setItemRowHeight(leftRow, [leftItems[index]]);
    setItemRowHeight(rightRow, [rightItems[index]]);
  });
  cellXfs.setAttribute("count", String(cellXfs.children.length));
  zip.file("xl/styles.xml", new XMLSerializer().serializeToString(stylesDocument));
  zip.file("xl/worksheets/sheet3.xml", new XMLSerializer().serializeToString(sheetDocument));

  const workbookDocument = new DOMParser().parseFromString(await workbookFile.async("string"), "application/xml");
  Array.from(workbookDocument.getElementsByTagNameNS(spreadsheetNamespace, "sheet"))
    .filter((sheet) => sheet.getAttribute("name") !== "FORM")
    .forEach((sheet) => sheet.remove());
  workbookDocument.getElementsByTagNameNS(spreadsheetNamespace, "pivotCaches")[0]?.remove();
  zip.file("xl/workbook.xml", new XMLSerializer().serializeToString(workbookDocument));

  const relationshipsNamespace = "http://schemas.openxmlformats.org/package/2006/relationships";
  const workbookRelationships = new DOMParser().parseFromString(await workbookRelationshipsFile.async("string"), "application/xml");
  Array.from(workbookRelationships.getElementsByTagNameNS(relationshipsNamespace, "Relationship"))
    .filter((relationship) => relationship.getAttribute("Type")?.endsWith("/worksheet") && relationship.getAttribute("Target") !== "worksheets/sheet3.xml" || relationship.getAttribute("Type")?.endsWith("/pivotCacheDefinition"))
    .forEach((relationship) => relationship.remove());
  zip.file("xl/_rels/workbook.xml.rels", new XMLSerializer().serializeToString(workbookRelationships));

  const contentTypesNamespace = "http://schemas.openxmlformats.org/package/2006/content-types";
  const contentTypes = new DOMParser().parseFromString(await contentTypesFile.async("string"), "application/xml");
  Array.from(contentTypes.getElementsByTagNameNS(contentTypesNamespace, "Override"))
    .filter((override) => /sheet[124]\.xml|drawing[124]\.xml|table1\.xml|pivot/i.test(override.getAttribute("PartName") || ""))
    .forEach((override) => override.remove());
  zip.file("[Content_Types].xml", new XMLSerializer().serializeToString(contentTypes));

  [
    "xl/worksheets/sheet1.xml",
    "xl/worksheets/sheet2.xml",
    "xl/worksheets/sheet4.xml",
    "xl/worksheets/_rels/sheet1.xml.rels",
    "xl/worksheets/_rels/sheet2.xml.rels",
    "xl/worksheets/_rels/sheet4.xml.rels",
    "xl/drawings/drawing1.xml",
    "xl/drawings/drawing2.xml",
    "xl/drawings/drawing4.xml",
    "xl/drawings/_rels/drawing1.xml.rels",
    "xl/drawings/_rels/drawing2.xml.rels",
    "xl/drawings/_rels/drawing4.xml.rels",
    "xl/tables/table1.xml",
    "xl/pivotTables/pivotTable1.xml",
    "xl/pivotTables/_rels/pivotTable1.xml.rels",
    "xl/pivotCache/pivotCacheDefinition1.xml",
    "xl/pivotCache/_rels/pivotCacheDefinition1.xml.rels",
  ].forEach((entry) => zip.remove(entry));

  const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `vehicle-maintenance-${new Date().toISOString().slice(0, 10)}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
