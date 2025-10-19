import { useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { formatHeaderText } from "../utils/formatHeaderText";
// import { formatHeaderText } from '../utils/formatHeaderText';

export const useTableExport = (table, config) => {
    // config.mapping: { key: (row) => value }
    const handlePrint = useMemo(
        () => () => {
            const printWindow = window.open("", "_blank");
            const tableColumn = [];
            const tableRows = [];

            table.getHeaderGroups()[0].headers.forEach((header) => {
                if (header.id !== "action" && header.id !== "select") {
                    const headerText = formatHeaderText(header.id);
                    tableColumn.push(headerText);
                }
            });

            table.getRowModel().rows.forEach((row) => {
                const rowData = row
                    .getVisibleCells()
                    .map((cell) => {
                        if (cell.column.id === "action") return null;
                        const originalRow = row.original;
                        const value = config.mapping[cell.column.id]
                            ? config.mapping[cell.column.id](originalRow)
                            : "N/A";
                        return value || "";
                    })
                    .filter(Boolean);
                tableRows.push(rowData);
            });

            let filterText = "";
            if (globalFilter) filterText += `Search: ${globalFilter}, `; // globalFilter external pass if needed
            config.filtersConfig.forEach((f) => {
                if (filters[f.key]?.length)
                    filterText += `${f.label}: ${filters[f.key].join(", ")}, `;
            });
            if (startDate && endDate)
                filterText += `Date: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}, `;

            const columnCount = tableColumn.length;
            const orientation = columnCount > 12 ? "landscape" : "portrait";
            let leftRightMargin =
                columnCount > 12 ? 10 : columnCount >= 8 ? 15 : 20;
            let headerFontSize =
                columnCount > 12 ? 8 : columnCount >= 8 ? 10 : 12;
            let bodyFontSize = columnCount > 12 ? 6 : columnCount >= 8 ? 8 : 10;

            const pageWidth = orientation === "landscape" ? 297 : 210;
            const availableWidth = pageWidth - 2 * leftRightMargin;
            const columnWidth = availableWidth / columnCount;

            const printContent = `
            <html>
                <head><title>${config.title} Report</title>
                <style>
                    @media print {@page {size: A4 ${orientation}; margin: ${leftRightMargin}mm;}
                    body {font-family: Arial, sans-serif; margin: ${leftRightMargin}mm;}
                    h1 {font-size: 16px; color: #2f4f4f; margin-bottom: 10px;}
                    .filters {font-size: 12px; color: #666; margin-bottom: 10px;}
                    table {width: 100%; border-collapse: collapse; table-layout: fixed;}
                    th, td {border: 1px solid #ccc; padding: 8px; text-align: left; word-wrap: break-word; width: ${columnWidth}mm;}
                    th {background-color: #2980b9; color: white; font-size: ${headerFontSize}px;}
                    td {font-size: ${bodyFontSize}px;}
                    tr:nth-child(even) {background-color: #f2f2f2;}
                    .footer {position: fixed; bottom: -5px; font-size: 10px; color: #999; width: 100%; text-align: left;}
                </style></head>
                <body><h1>${config.title} Report</h1>
                ${
                    filterText
                        ? `<p class="filters">Filters: ${filterText.slice(
                              0,
                              -2
                          )}</p>`
                        : ""
                }
                <table><thead><tr>${tableColumn
                    .map((col) => `<th>${col}</th>`)
                    .join("")}</tr></thead>
                <tbody>${tableRows
                    .map(
                        (row) =>
                            `<tr>${row
                                .map((cell) => `<td>${cell}</td>`)
                                .join("")}</tr>`
                    )
                    .join("")}</tbody></table>
                <div class="footer">Page <span class="pageNumber"></span> of <span class="totalPages"></span> | Generated on ${new Date().toLocaleString()}</div></body></html>
        `;

            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.print();
        },
        [table, config]
    );

    const exportToPDF = useMemo(
        () => () => {
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });
            const tableColumn = table
                .getHeaderGroups()[0]
                .headers.filter((h) => h.id !== "action" && h.id !== "select")
                .map((h) => formatHeaderText(h.id));
            const tableRows = table.getRowModel().rows.map((row) =>
                row
                    .getVisibleCells()
                    .map((cell) =>
                        config.mapping[cell.column.id]
                            ? config.mapping[cell.column.id](row.original)
                            : "N/A"
                    )
                    .filter(Boolean)
            );

            const columnCount = tableColumn.length;
            let leftRightMargin =
                columnCount > 12 ? 10 : columnCount >= 8 ? 15 : 20;
            let headerFontSize =
                columnCount > 12 ? 5 : columnCount >= 8 ? 6 : 8;
            let bodyFontSize = columnCount > 12 ? 4 : columnCount >= 8 ? 5 : 6;

            const pageWidth = 210;
            const availableWidth = pageWidth - 2 * leftRightMargin;
            const columnWidth = availableWidth / columnCount;
            const columnStyles = tableColumn.reduce(
                (acc, _, idx) => ({
                    ...acc,
                    [idx]: { cellWidth: columnWidth },
                }),
                {}
            );

            doc.setFontSize(7);
            doc.setTextColor(40);
            doc.text(`${config.title} Report`, leftRightMargin, 15);

            let filterText = ""; // similar to print
            // ... (filter build logic same as print)
            if (filterText) {
                doc.setFontSize(7);
                doc.setTextColor(100);
                doc.text(
                    `Filters: ${filterText.slice(0, -2)}`,
                    leftRightMargin,
                    22
                );
            }

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 30,
                theme: "grid",
                showHead: "firstPage",
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: [255, 255, 255],
                    fontSize: headerFontSize,
                    halign: "center",
                },
                bodyStyles: {
                    fontSize: bodyFontSize,
                    textColor: [50, 50, 50],
                    lineColor: [200, 200, 200],
                },
                alternateRowStyles: { fillColor: [240, 240, 240] },
                margin: {
                    top: 30,
                    left: leftRightMargin,
                    right: leftRightMargin,
                },
                columnStyles,
            });

            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(6);
                doc.setTextColor(150);
                doc.text(
                    `Page ${i} of ${pageCount} | Generated on ${new Date().toLocaleString()}`,
                    leftRightMargin,
                    doc.internal.pageSize.height - 10
                );
            }

            doc.save(
                `${config.title.toLowerCase()}_report_${new Date()
                    .toISOString()
                    .slice(0, 10)}.pdf`
            );
        },
        [table, config]
    );

    const exportToExcel = useMemo(
        () => () => {
            // Similar to PDF, but XLSX
            const tableColumn = table
                .getHeaderGroups()[0]
                .headers.filter((h) => h.id !== "action" && h.id !== "select")
                .map((h) => formatHeaderText(h.id));
            const tableRows = table.getRowModel().rows.map((row) =>
                row
                    .getVisibleCells()
                    .map((cell) =>
                        config.mapping[cell.column.id]
                            ? config.mapping[cell.column.id](row.original)
                            : "N/A"
                    )
                    .filter(Boolean)
            );

            let filterText = ""; // same as above

            const wsData = [
                [`${config.title} Report`],
                [],
                ...(filterText ? [["Filters:", filterText.slice(0, -2)]] : []),
                [],
                tableColumn,
                ...tableRows,
            ];

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(wsData);

            // Styling (same as SalesTable)
            ws["A1"].s = {
                font: { sz: 16, bold: true },
                alignment: { horizontal: "left" },
            };
            if (filterText) {
                ws["A3"].s = {
                    font: { sz: 12 },
                    alignment: { horizontal: "left" },
                };
                ws["B3"].s = {
                    font: { sz: 12 },
                    alignment: { horizontal: "left" },
                };
            }
            tableColumn.forEach((_, idx) => {
                const r = filterText ? 4 : 3;
                const cellRef = XLSX.utils.encode_cell({ r, c: idx });
                ws[cellRef].s = {
                    font: { sz: 12, bold: true },
                    alignment: { horizontal: "center" },
                    fill: { fgColor: { rgb: "2980B9" } },
                };
            });
            tableRows.forEach((row, rowIdx) => {
                row.forEach((cell, colIdx) => {
                    const r = (filterText ? 5 : 4) + rowIdx;
                    const cellRef = XLSX.utils.encode_cell({ r, c: colIdx });
                    ws[cellRef].s = {
                        font: { sz: 10 },
                        alignment: { horizontal: "left" },
                    };
                });
            });

            ws["!cols"] = tableColumn.map((h) => ({
                wch: Math.max(h.length, 10),
            }));
            XLSX.utils.book_append_sheet(wb, ws, `${config.title} Report`);
            XLSX.writeFile(
                wb,
                `${config.title.toLowerCase()}_report_${new Date()
                    .toISOString()
                    .slice(0, 10)}.xlsx`
            );
        },
        [table, config]
    );

    return { handlePrint, exportToPDF, exportToExcel };
};
