import * as XLSX from "xlsx";

export type SheetData = {
  name: string;
  rows: Record<string, string | number>[];
};

/** Génère et télécharge un classeur Excel (.xlsx) */
export function downloadExcelWorkbook(sheets: SheetData[], filename: string) {
  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const safeName = sheet.name.replace(/[\\/?*[\]]/g, "").slice(0, 31);
    const worksheet = XLSX.utils.json_to_sheet(sheet.rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, safeName || "Feuille");
  }

  XLSX.writeFile(workbook, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

/** Une seule feuille */
export function downloadExcelSheet(
  rows: Record<string, string | number>[],
  sheetName: string,
  filename: string
) {
  downloadExcelWorkbook([{ name: sheetName, rows }], filename);
}
