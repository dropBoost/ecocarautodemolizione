// src/app/api/veicoliTransito/route.js
import { colorBrandARGB } from "@/app/cosetting";
import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

function toDateOrNull(v) {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d) ? null : d;
}

export async function POST(req) {
  try {
    const body = await req.json();

    const rows = Array.isArray(body?.rows) ? body.rows : [];
    const columns = Array.isArray(body?.columns) ? body.columns : [];
    const filename = body?.filename || "export.xlsx";
    const sheetName = body?.sheetName || "Export";

    if (!columns.length) {
      return NextResponse.json({ error: "columns è vuoto" }, { status: 400 });
    }
    if (!rows.length) {
      return NextResponse.json({ error: "rows è vuoto" }, { status: 400 });
    }

    const normCols = columns
      .filter((c) => c && c.header && c.key)
      .map((c) => ({
        header: String(c.header),
        key: String(c.key),
        width: Number.isFinite(c.width) ? c.width : 18,
        type: c.type ? String(c.type) : undefined, // "date" | "datetime" | "money" | "number"
      }));

    if (!normCols.length) {
      return NextResponse.json(
        { error: "columns non contiene elementi validi (serve header+key)" },
        { status: 400 }
      );
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Next.js";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(sheetName, {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    // COLONNE
    sheet.columns = normCols.map((c) => ({
      header: c.header,
      key: c.key,
      width: c.width,
    }));

    // HEADER
    const headerRow = sheet.getRow(1);

    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" }, };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };

      // sfondo
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colorBrandARGB },
      };
    });

    // CONVERSIONE DATA E ABBINAMENTO KEY COLONNE
    for (const r of rows) {
      const out = {};
      for (const c of normCols) {
        let val = r?.[c.key];

        if (c.type === "date" || c.type === "datetime") {
          val = toDateOrNull(val);
        } else if (val === undefined) {
          val = "";
        }

        out[c.key] = val;
      }
      sheet.addRow(out);
    }

    // FROMATI COLONNA
    normCols.forEach((c) => {
      const col = sheet.getColumn(c.key);
      if (c.type === "date") col.numFmt = "dd/mm/yyyy";
      if (c.type === "datetime") col.numFmt = "dd/mm/yyyy hh:mm";
      if (c.type === "money") col.numFmt = '#,##0.00 [$€-it-IT]';
      if (c.type === "number") col.numFmt = "#,##0.00";
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[export-excel] error:", e);
    return NextResponse.json(
      { error: "Errore generazione Excel" },
      { status: 500 }
    );
  }
}
