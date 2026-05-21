import * as XLSX from "xlsx";

export type SheetRow = Record<string, string | number | boolean | undefined | null>;

export function rowsToSheet(rows: SheetRow[], sheetName: string): XLSX.WorkSheet {
  return XLSX.utils.json_to_sheet(rows);
}

export function downloadWorkbook(
  sheets: { name: string; rows: SheetRow[] }[],
  filename: string
) {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(({ name, rows }) => {
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, name.slice(0, 31));
  });

  XLSX.writeFile(workbook, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}
