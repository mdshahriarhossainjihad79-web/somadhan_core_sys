import { Head, router, usePage } from "@inertiajs/react";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import MainLayouts from "../../layouts/MainLayouts";
import { useEffect, useMemo, useRef, useState } from "react";
import useTableFieldHideShow from "../../hook/useTableFieldHideShow";
import FilterDropdown from "../../components/FilterDropdown";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import DatePicker from "react-datepicker";
import { Icon } from "@iconify/react";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import toast from "react-hot-toast";
import { isWithinInterval, parseISO } from "date-fns";
import { formatHeaderText } from "../../utils/formatHeaderText";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const StockTracking = () => {
    const { props } = usePage();
    const { stockTrackings, auth, pos_settings, success, error } = props;
    const permissions = auth.permissions || [];
    const [globalFilter, setGlobalFilter] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [sorting, setSorting] = useState([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [filters, setFilters] = useState({
        branch: [],
        product: [],
        variation: [],
        size: [],
        color: [],
        b2b_price: [],
        b2c_price: [],
        cost_price: [],
        stock_id: [],
        batch_number: [],
        reference_type: [],
        quantity: [],
        warehouse: [],
        rack: [],
        created_by: [],
        party: [],
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStockTrackingId, setSelectedStockTrackingId] =
        useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
    const [isTooltipOpen, setIsTooltipOpen] = useState(false);

    const [totalStockTrackingsCount, setTotalStockTrackingsCount] = useState(
        stockTrackings.length
    );

    const dropdownRef = useRef(null);

    // handle flash message
    useEffect(() => {
        if (success) {
            toast.success(success, {
                duration: 4000,
                position: "top-center",
            });
        }
        if (error) {
            toast.error(error, {
                duration: 4000,
                position: "top-center",
            });
        }
    }, [success, error]);

    // manage Handle Outside Click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsActionDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const {
        stockTrackingManageTableFields,
        handleFieldChange,
        showBranch,
        showProduct,
        showVariation,
        showSize,
        showColor,
        showB2BPrice,
        showB2CPrice,
        showCostPrice,
        showStockId,
        showBatchNumber,
        showReferenceType,
        showQuantity,
        showWarehouse,
        showRack,
        showParty,
        showCreatedBy,
        showAction,
    } = useTableFieldHideShow(); // Adjust hook for stock tracking fields if needed

    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        const tableColumn = [];
        const tableRows = [];

        table.getHeaderGroups()[0].headers.forEach((header) => {
            if (header.id !== "action" && header.id !== "select") {
                const headerText =
                    typeof header.column.columnDef.header === "function"
                        ? formatHeaderText(header.id)
                        : header.column.columnDef.header?.toString() ||
                          formatHeaderText(header.id);
                tableColumn.push(headerText);
            }
        });

        // Table data rows
        table.getRowModel().rows.forEach((row) => {
            const rowData = row
                .getVisibleCells()
                .map((cell) => {
                    if (cell.column.id === "action") return null;
                    const originalRow = row.original;

                    switch (cell.column.id) {
                        case "sl":
                            return String(row.index + 1);
                        case "branch":
                            return originalRow.branch?.name ?? "N/A";
                        case "product":
                            return originalRow.product?.name ?? "N/A";
                        case "variation":
                            return (
                                originalRow.variation?.variation_name ?? "N/A"
                            );
                        case "size":
                            return (
                                originalRow.variation?.variation_size?.size ??
                                "N/A"
                            );
                        case "color":
                            return (
                                originalRow.variation?.color_name?.name ?? "N/A"
                            );
                        case "b2b_price":
                            return originalRow.variation?.b2b_price ?? "N/A";
                        case "b2c_price":
                            return originalRow.variation?.b2c_price ?? "N/A";
                        case "cost_price":
                            return originalRow.variation?.cost_price ?? "N/A";
                        case "quantity":
                            return originalRow.quantity ?? "N/A";
                        case "stock_id":
                            return originalRow.stock_id ?? "N/A";
                        case "party":
                            return originalRow.party?.name ?? "N/A";
                        case "created_by":
                            return originalRow.stock_by?.name ?? "N/A";
                        case "batch_number":
                            return originalRow.batch_number ?? "N/A";
                        case "reference_type":
                            return originalRow.reference_type ?? "N/A";
                        case "reference":
                            return (
                                originalRow.reference?.invoice_number ?? "N/A"
                            ); // Adjust based on reference model
                        case "warehouse":
                            return originalRow.warehouse?.name ?? "N/A";
                        case "rack":
                            return originalRow.racks?.name ?? "N/A";
                        default:
                            return "";
                    }
                })
                .filter(Boolean);
            tableRows.push(rowData);
        });

        // Filter information
        let filterText = "";
        if (globalFilter) filterText += `Search: ${globalFilter}, `;
        if (startDate && endDate)
            filterText += `Date: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}, `;
        if (filters.branch.length)
            filterText += `Branch: ${filters.branch.join(", ")}, `;
        if (filters.product.length)
            filterText += `Product: ${filters.product.join(", ")}, `;
        if (filters.variation.length)
            filterText += `Variation: ${filters.variation.join(", ")}, `;
        if (filters.size?.length)
            filterText += `Size: ${filters.size.join(", ")}, `;
        if (filters.color?.length)
            filterText += `Color: ${filters.color.join(", ")}, `;
        if (filters.b2b_price?.start) {
            filterText += `B2B Price: ${filters.b2b_price.start} - ${
                filters.b2b_price.end || "∞"
            }, `;
        }
        if (filters.b2c_price?.start) {
            filterText += `B2C Price: ${filters.b2c_price.start} - ${
                filters.b2c_price.end || "∞"
            }, `;
        }
        if (filters.cost_price?.start) {
            filterText += `Cost Price: ${filters.cost_price.start} - ${
                filters.cost_price.end || "∞"
            }, `;
        }
        if (filters.party.length)
            filterText += `Party: ${filters.party.join(", ")}, `;
        if (filters.created_by.length)
            filterText += `Created By: ${filters.created_by.join(", ")}, `;
        if (filters.reference_type.length)
            filterText += `Reference Type: ${filters.reference_type.join(
                ", "
            )}, `;
        if (filters.quantity.length)
            filterText += `Quantity: ${filters.quantity.join(", ")}, `;
        if (filters.warehouse.length)
            filterText += `Warehouse: ${filters.warehouse.join(", ")}, `;
        if (filters.rack.length)
            filterText += `Rack: ${filters.rack.join(", ")}, `;

        // Dynamic settings based on column count
        const columnCount = tableColumn.length;
        const orientation = columnCount > 12 ? "landscape" : "portrait";
        let leftRightMargin = 20;
        let headerFontSize = 12;
        let bodyFontSize = 10;

        if (columnCount > 12) {
            leftRightMargin = 10;
            headerFontSize = 8;
            bodyFontSize = 6;
        } else if (columnCount >= 8) {
            leftRightMargin = 15;
            headerFontSize = 10;
            bodyFontSize = 8;
        }

        const pageWidth = orientation === "landscape" ? 297 : 210;
        const availableWidth = pageWidth - 2 * leftRightMargin;
        const columnWidth = availableWidth / columnCount;

        // HTML for print window
        const printContent = `
            <html>
                <head>
                    <title>Stock Tracking Report</title>
                    <style>
                        @media print {
                            @page {
                                size: A4 ${orientation};
                                margin: ${leftRightMargin}mm;
                            }
                            body {
                                font-family: Arial, sans-serif;
                                margin: ${leftRightMargin}mm;
                            }
                            h1 {
                                font-size: 16px;
                                color: #2f4f4f;
                                margin-bottom: 10px;
                            }
                            .filters {
                                font-size: 12px;
                                color: #666;
                                margin-bottom: 10px;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                table-layout: fixed;
                            }
                            th, td {
                                border: 1px solid #ccc;
                                padding: 8px;
                                text-align: left;
                                word-wrap: break-word;
                                width: ${columnWidth}mm;
                            }
                            th {
                                background-color: #2980b9;
                                color: white;
                                font-size: ${headerFontSize}px;
                            }
                            td {
                                font-size: ${bodyFontSize}px;
                            }
                            tr:nth-child(even) {
                                background-color: #f2f2f2;
                            }
                            .footer {
                                position: fixed;
                                bottom: -5px;
                                font-size: 10px;
                                color: #999;
                                width: 100%;
                                text-align: left;
                            }
                        }
                    </style>
                </head>
                <body>
                    <h1>Stock Tracking Report</h1>
                    ${
                        filterText
                            ? `<p class="filters">Filters: ${filterText.slice(
                                  0,
                                  -2
                              )}</p>`
                            : ""
                    }
                    <table>
                        <thead>
                            <tr>
                                ${tableColumn
                                    .map((col) => `<th>${col}</th>`)
                                    .join("")}
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows
                                .map(
                                    (row) =>
                                        `<tr>${row
                                            .map((cell) => `<td>${cell}</td>`)
                                            .join("")}</tr>`
                                )
                                .join("")}
                        </tbody>
                    </table>
                    <div class="footer">
                        Page <span class="pageNumber"></span> of <span class="totalPages"></span> | Generated on ${new Date().toLocaleString()}
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    };

    // PDF Export function
    const exportToPDF = () => {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });
        const tableColumn = [];
        const tableRows = [];

        table.getHeaderGroups()[0].headers.forEach((header) => {
            if (header.id !== "action" && header.id !== "select") {
                const headerText =
                    typeof header.column.columnDef.header === "function"
                        ? formatHeaderText(header.id)
                        : header.column.columnDef.header?.toString() ||
                          formatHeaderText(header.id);
                tableColumn.push(headerText);
            }
        });

        // table data row
        table.getRowModel().rows.forEach((row) => {
            const rowData = row
                .getVisibleCells()
                .map((cell) => {
                    if (cell.column.id === "action") return null;
                    const originalRow = row.original;

                    switch (cell.column.id) {
                        case "sl":
                            return String(row.index + 1);
                        case "branch":
                            return originalRow.branch?.name ?? "N/A";
                        case "product":
                            return originalRow.product?.name ?? "N/A";
                        case "variation":
                            return (
                                originalRow.variation?.variation_name ?? "N/A"
                            );
                        case "size":
                            return (
                                originalRow.variation?.variation_size?.size ??
                                "N/A"
                            );
                        case "color":
                            return (
                                originalRow.variation?.color_name?.name ?? "N/A"
                            );
                        case "b2b_price":
                            return originalRow.variation?.b2b_price ?? "N/A";
                        case "b2c_price":
                            return originalRow.variation?.b2c_price ?? "N/A";
                        case "cost_price":
                            return originalRow.variation?.cost_price ?? "N/A";
                        case "quantity":
                            return originalRow.quantity ?? "N/A";
                        case "stock_id":
                            return originalRow.stock_id ?? "N/A";
                        case "party":
                            return originalRow.party?.name ?? "N/A";
                        case "created_by":
                            return originalRow.stock_by?.name ?? "N/A";
                        case "batch_number":
                            return originalRow.batch_number ?? "N/A";
                        case "reference_type":
                            return originalRow.reference_type ?? "N/A";
                        case "reference":
                            return (
                                originalRow.reference?.invoice_number ?? "N/A"
                            ); // Adjust based on reference
                        case "quantity":
                            return originalRow.quantity ?? "N/A";
                        case "warehouse":
                            return originalRow.warehouse?.name ?? "N/A";
                        case "rack":
                            return originalRow.racks?.name ?? "N/A";
                        default:
                            return "";
                    }
                })
                .filter(Boolean);
            tableRows.push(rowData);
        });

        const columnCount = tableColumn.length;
        let leftRightMargin = 20;
        let headerFontSize = 8;
        let bodyFontSize = 6;

        if (columnCount > 12) {
            leftRightMargin = 10;
            headerFontSize = 5;
            bodyFontSize = 4;
        } else if (columnCount >= 8) {
            leftRightMargin = 15;
            headerFontSize = 6;
            bodyFontSize = 5;
        }

        const pageWidth = 210;
        const availableWidth = pageWidth - 2 * leftRightMargin;
        const columnWidth = availableWidth / columnCount;

        const columnStyles = {};
        tableColumn.forEach((_, index) => {
            columnStyles[index] = { cellWidth: columnWidth };
        });

        // PDF Header
        doc.setFontSize(7);
        doc.setTextColor(40);
        doc.text("Stock Tracking Report", leftRightMargin, 15);

        // filter Status
        let filterText = "";
        if (globalFilter) filterText += `Search: ${globalFilter}, `;
        if (startDate && endDate)
            filterText += `Date: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}, `;
        if (filters.branch.length)
            filterText += `Branch: ${filters.branch.join(", ")}, `;
        if (filters.product.length)
            filterText += `Product: ${filters.product.join(", ")}, `;
        if (filters.variation.length)
            filterText += `Variation: ${filters.variation.join(", ")}, `;
        if (filters.size?.length)
            filterText += `Size: ${filters.size.join(", ")}, `;
        if (filters.color?.length)
            filterText += `Color: ${filters.color.join(", ")}, `;
        if (filters.b2b_price?.start) {
            filterText += `B2B Price: ${filters.b2b_price.start} - ${
                filters.b2b_price.end || "∞"
            }, `;
        }
        if (filters.b2c_price?.start) {
            filterText += `B2C Price: ${filters.b2c_price.start} - ${
                filters.b2c_price.end || "∞"
            }, `;
        }
        if (filters.cost_price?.start) {
            filterText += `Cost Price: ${filters.cost_price.start} - ${
                filters.cost_price.end || "∞"
            }, `;
        }
        if (filters.party.length)
            filterText += `Party: ${filters.party.join(", ")}, `;
        if (filters.created_by.length)
            filterText += `Created By: ${filters.created_by.join(", ")}, `;
        if (filters.reference_type.length)
            filterText += `Reference Type: ${filters.reference_type.join(
                ", "
            )}, `;
        if (filters.quantity.length)
            filterText += `Quantity: ${filters.quantity.join(", ")}, `;
        if (filters.warehouse.length)
            filterText += `Warehouse: ${filters.warehouse.join(", ")}, `;
        if (filters.rack.length)
            filterText += `Rack: ${filters.rack.join(", ")}, `;
        if (filterText) {
            doc.setFontSize(7);
            doc.setTextColor(100);
            doc.text(
                `Filters: ${filterText.slice(0, -2)}`,
                leftRightMargin,
                22
            );
        }

        // make table
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
            alternateRowStyles: {
                fillColor: [240, 240, 240],
            },
            margin: { top: 30, left: leftRightMargin, right: leftRightMargin },
            columnStyles: columnStyles,
        });

        // footer e page number and date
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

        // PDF Save
        doc.save(
            `stock_tracking_report_${new Date().toISOString().slice(0, 10)}.pdf`
        );
    };

    // excel export
    const exportToExcel = () => {
        const tableColumn = [];
        const tableRows = [];

        // Column headers
        table.getHeaderGroups()[0].headers.forEach((header) => {
            if (header.id !== "action" && header.id !== "select") {
                const headerText =
                    typeof header.column.columnDef.header === "function"
                        ? formatHeaderText(header.id)
                        : header.column.columnDef.header?.toString() ||
                          formatHeaderText(header.id);
                tableColumn.push(headerText);
            }
        });

        // Table data rows
        table.getRowModel().rows.forEach((row) => {
            const rowData = row
                .getVisibleCells()
                .map((cell) => {
                    if (cell.column.id === "action") return null;
                    const originalRow = row.original;

                    switch (cell.column.id) {
                        case "sl":
                            return String(row.index + 1);
                        case "branch":
                            return originalRow.branch?.name ?? "N/A";
                        case "product":
                            return originalRow.product?.name ?? "N/A";
                        case "variation":
                            return (
                                originalRow.variation?.variation_name ?? "N/A"
                            );
                        case "size":
                            return (
                                originalRow.variation?.variation_size?.size ??
                                "N/A"
                            );
                        case "color":
                            return (
                                originalRow.variation?.color_name?.name ?? "N/A"
                            );
                        case "b2b_price":
                            return originalRow.variation?.b2b_price ?? "N/A";
                        case "b2c_price":
                            return originalRow.variation?.b2c_price ?? "N/A";
                        case "cost_price":
                            return originalRow.variation?.cost_price ?? "N/A";
                        case "quantity":
                            return originalRow.quantity ?? "N/A";
                        case "stock_id":
                            return originalRow.stock_id ?? "N/A";
                        case "party":
                            return originalRow.party?.name ?? "N/A";
                        case "created_by":
                            return originalRow.stock_by?.name ?? "N/A";
                        case "batch_number":
                            return originalRow.batch_number ?? "N/A";
                        case "reference_type":
                            return originalRow.reference_type ?? "N/A";
                        case "reference":
                            return (
                                originalRow.reference?.invoice_number ?? "N/A"
                            ); // Adjust
                        case "quantity":
                            return originalRow.quantity ?? "N/A";
                        case "warehouse":
                            return originalRow.warehouse?.name ?? "N/A";
                        case "rack":
                            return originalRow.racks?.name ?? "N/A";
                        default:
                            return "";
                    }
                })
                .filter(Boolean);
            tableRows.push(rowData);
        });

        // Filter information
        let filterText = "";
        if (globalFilter) filterText += `Search: ${globalFilter}, `;
        if (startDate && endDate)
            filterText += `Date: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}, `;
        if (filters.branch.length)
            filterText += `Branch: ${filters.branch.join(", ")}, `;
        if (filters.product.length)
            filterText += `Product: ${filters.product.join(", ")}, `;
        if (filters.variation.length)
            filterText += `Variation: ${filters.variation.join(", ")}, `;
        if (filters.size?.length)
            filterText += `Size: ${filters.size.join(", ")}, `;
        if (filters.color?.length)
            filterText += `Color: ${filters.color.join(", ")}, `;
        if (filters.b2b_price?.start) {
            filterText += `B2B Price: ${filters.b2b_price.start} - ${
                filters.b2b_price.end || "∞"
            }, `;
        }
        if (filters.b2c_price?.start) {
            filterText += `B2C Price: ${filters.b2c_price.start} - ${
                filters.b2c_price.end || "∞"
            }, `;
        }
        if (filters.cost_price?.start) {
            filterText += `Cost Price: ${filters.cost_price.start} - ${
                filters.cost_price.end || "∞"
            }, `;
        }
        if (filters.party.length)
            filterText += `Party: ${filters.party.join(", ")}, `;
        if (filters.created_by.length)
            filterText += `Created By: ${filters.created_by.join(", ")}, `;
        if (filters.reference_type.length)
            filterText += `Reference Type: ${filters.reference_type.join(
                ", "
            )}, `;
        if (filters.quantity.length)
            filterText += `Quantity: ${filters.quantity.join(", ")}, `;
        if (filters.warehouse.length)
            filterText += `Warehouse: ${filters.warehouse.join(", ")}, `;
        if (filters.rack.length)
            filterText += `Rack: ${filters.rack.join(", ")}, `;

        // Create Excel data
        const wsData = [
            ["Stock Tracking Report"], // Header
            [], // Empty row for spacing
            ...(filterText ? [["Filters:", filterText.slice(0, -2)]] : []), // Filter information
            [], // Empty row for spacing
            tableColumn, // Table headers
            ...tableRows, // Table rows
        ];

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Styling for header
        ws["A1"] = {
            ...ws["A1"],
            s: {
                font: { sz: 16, bold: true },
                alignment: { horizontal: "left" },
            },
        };

        // Styling for filter text
        if (filterText) {
            ws["A3"] = {
                ...ws["A3"],
                s: { font: { sz: 12 }, alignment: { horizontal: "left" } },
            };
            ws["B3"] = {
                ...ws["B3"],
                s: { font: { sz: 12 }, alignment: { horizontal: "left" } },
            };
        }

        // Styling for table headers
        tableColumn.forEach((_, index) => {
            const cellRef = XLSX.utils.encode_cell({
                r: filterText ? 4 : 3,
                c: index,
            });
            ws[cellRef] = {
                ...ws[cellRef],
                s: {
                    font: { sz: 12, bold: true },
                    alignment: { horizontal: "center" },
                    fill: { fgColor: { rgb: "2980B9" } },
                },
            };
        });

        // Styling for table body
        tableRows.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellRef = XLSX.utils.encode_cell({
                    r: (filterText ? 5 : 4) + rowIndex,
                    c: colIndex,
                });
                ws[cellRef] = {
                    ...ws[cellRef],
                    s: { font: { sz: 10 }, alignment: { horizontal: "left" } },
                };
            });
        });

        // Auto-fit column widths
        const colWidths = tableColumn.map((header) => ({
            wch: Math.max(header.length, 10),
        }));
        ws["!cols"] = colWidths;

        // Append worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "Stock Tracking Report");

        // Generate and download Excel file
        XLSX.writeFile(
            wb,
            `stock_tracking_report_${new Date()
                .toISOString()
                .slice(0, 10)}.xlsx`
        );
    };

    // Columns useMemo
    const columns = useMemo(() => {
        // Generate options
        const branchOptions = [
            ...new Set(stockTrackings.map((row) => row.branch?.name ?? "N/A")),
        ];
        const productOptions = [
            ...new Set(stockTrackings.map((row) => row.product?.name ?? "N/A")),
        ];
        const variationOptions = [
            ...new Set(
                stockTrackings.map(
                    (row) => row.variation?.variation_name ?? "N/A"
                )
            ),
        ];

        const sizeOptions = [
            ...new Set(
                stockTrackings.map(
                    (row) => row.variation?.variation_size?.size ?? "N/A"
                )
            ),
        ];
        const colorOptions = [
            ...new Set(
                stockTrackings.map(
                    (row) => row.variation?.color_name?.name ?? "N/A"
                )
            ),
        ];
        const b2bPriceOptions = [
            ...new Set(
                stockTrackings.map((row) => row.variation?.b2b_price ?? "N/A")
            ),
        ];
        const b2cPriceOptions = [
            ...new Set(
                stockTrackings.map((row) => row.variation?.b2c_price ?? "N/A")
            ),
        ];
        const costPriceOptions = [
            ...new Set(
                stockTrackings.map((row) => row.variation?.cost_price ?? "N/A")
            ),
        ];
        const referenceTypeOptions = [
            ...new Set(
                stockTrackings.map((row) => row.reference_type ?? "N/A")
            ),
        ];
        const warehouseOptions = [
            ...new Set(
                stockTrackings.map((row) => row.warehouse?.name ?? "N/A")
            ),
        ];
        const rackOptions = [
            ...new Set(stockTrackings.map((row) => row.racks?.name ?? "N/A")),
        ];

        const partyOptions = [
            ...new Set(stockTrackings.map((row) => row.party?.name ?? "N/A")),
        ];
        const createdByOptions = [
            ...new Set(
                stockTrackings.map((row) => row.stock_by?.name ?? "N/A")
            ),
        ];

        const handleClearDateFilter = () => {
            setStartDate(null);
            setEndDate(null);
        };

        const handleSelectAll = (e) => {
            if (e.target.checked) {
                const allRowIds = table
                    .getRowModel()
                    .rows.map((row) => row.original.id);
                setSelectedRows(allRowIds);
            } else {
                setSelectedRows([]);
            }
        };

        const handleRowSelect = (id) => {
            setSelectedRows((prev) =>
                prev.includes(id)
                    ? prev.filter((rowId) => rowId !== id)
                    : [...prev, id]
            );
        };

        const handleFilterChange = (field, values) => {
            setFilters((prev) => ({ ...prev, [field]: values }));
        };

        const baseColumns = [
            {
                id: "select",
                header: () => (
                    <input
                        type="checkbox"
                        checked={
                            table.getRowModel().rows.length > 0 &&
                            selectedRows.length ===
                                table.getRowModel().rows.length
                        }
                        onChange={handleSelectAll}
                        className="h-4 w-4"
                    />
                ),
                cell: ({ row }) => (
                    <input
                        type="checkbox"
                        checked={selectedRows.includes(row.original.id)}
                        onChange={() => handleRowSelect(row.original.id)}
                        className="h-4 w-4"
                    />
                ),
                meta: { responsive: true },
            },
            {
                id: "sl",
                header: "SL No",
                cell: ({ row }) => {
                    console.log("Row Data:", row.original);
                    return row.index + 1;
                },
                enableSorting: true,
                meta: { responsive: true },
            },
            ...(showBranch
                ? [
                      {
                          accessorFn: (row) => row.branch?.name ?? "N/A",
                          id: "branch",
                          header: () => (
                              <div className="flex items-center gap-2">
                                  Branch
                                  <FilterDropdown
                                      field="branch"
                                      options={branchOptions}
                                      selectedValues={filters.branch || []}
                                      onChange={handleFilterChange}
                                      filterType="checkbox"
                                  />
                              </div>
                          ),
                          enableSorting: false,
                          meta: { responsive: true },
                      },
                  ]
                : []),
            ...(showProduct
                ? [
                      {
                          accessorFn: (row) => row.product?.name ?? "N/A",
                          id: "product",
                          header: () => (
                              <div className="flex items-center gap-2">
                                  Product
                                  <FilterDropdown
                                      field="product"
                                      options={productOptions}
                                      selectedValues={filters.product || []}
                                      onChange={handleFilterChange}
                                      filterType="checkbox"
                                  />
                              </div>
                          ),
                          enableSorting: false,
                          meta: { responsive: true },
                      },
                  ]
                : []),
            ...(showVariation
                ? [
                      {
                          accessorFn: (row) =>
                              row.variation?.variation_name ?? "N/A",
                          id: "variation",
                          header: () => (
                              <div className="flex items-center gap-2">
                                  Variation
                                  <FilterDropdown
                                      field="variation"
                                      options={variationOptions}
                                      selectedValues={filters.variation || []}
                                      onChange={handleFilterChange}
                                      filterType="checkbox"
                                  />
                              </div>
                          ),
                          enableSorting: false,
                          meta: { responsive: true },
                      },
                  ]
                : []),
            ...(showSize
                ? [
                      {
                          accessorFn: (row) =>
                              row.variation?.variation_size?.size ?? "N/A",
                          id: "size",
                          header: () => (
                              <div className="flex items-center gap-2">
                                  Size
                                  <FilterDropdown
                                      field="size"
                                      options={sizeOptions}
                                      selectedValues={filters.size || []}
                                      onChange={handleFilterChange}
                                      filterType="checkbox"
                                  />
                              </div>
                          ),
                          enableSorting: false,
                          meta: { responsive: true },
                      },
                  ]
                : []),
            ...(showColor
                ? [
                      {
                          accessorFn: (row) =>
                              row.variation?.color_name?.name ?? "N/A",
                          id: "color",
                          header: () => (
                              <div className="flex items-center gap-2">
                                  Color
                                  <FilterDropdown
                                      field="color"
                                      options={colorOptions}
                                      selectedValues={filters.color || []}
                                      onChange={handleFilterChange}
                                      filterType="checkbox"
                                  />
                              </div>
                          ),
                          enableSorting: false,
                          meta: { responsive: true },
                      },
                  ]
                : []),
            ...(showB2BPrice
                ? [
                      {
                          accessorFn: (row) =>
                              row.variation?.b2b_price ?? "N/A",
                          id: "b2b_price",
                          header: () => (
                              <div className="flex items-center gap-2">
                                  B2B Price
                                  <FilterDropdown
                                      field="b2b_price"
                                      options={b2bPriceOptions}
                                      selectedValues={filters.b2b_price || []}
                                      onChange={handleFilterChange}
                                      filterType="numeric"
                                  />
                              </div>
                          ),
                          enableSorting: false,
                          meta: { responsive: true },
                      },
                  ]
                : []),
            ...(showB2CPrice
                ? [
                      {
                          accessorFn: (row) =>
                              row.variation?.b2c_price ?? "N/A",
                          id: "b2c_price",
                          header: () => (
                              <div className="flex items-center gap-2">
                                  B2C Price
                                  <FilterDropdown
                                      field="b2c_price"
                                      options={b2cPriceOptions}
                                      selectedValues={filters.b2c_price || []}
                                      onChange={handleFilterChange}
                                      filterType="numeric"
                                  />
                              </div>
                          ),
                          enableSorting: false,
                          meta: { responsive: true },
                      },
                  ]
                : []),
            ...(showCostPrice
                ? [
                      {
                          accessorFn: (row) =>
                              row.variation?.cost_price ?? "N/A",
                          id: "cost_price",
                          header: () => (
                              <div className="flex items-center gap-2">
                                  Cost Price
                                  <FilterDropdown
                                      field="cost_price"
                                      options={costPriceOptions}
                                      selectedValues={filters.cost_price || []}
                                      onChange={handleFilterChange}
                                      filterType="numeric"
                                  />
                              </div>
                          ),
                          enableSorting: false,
                          meta: { responsive: true },
                      },
                  ]
                : []),
            {
                accessorKey: "quantity",
                header: () => (
                    <div className="flex items-center gap-2">
                        Quantity
                        <FilterDropdown
                            field="quantity"
                            options={[]}
                            selectedValues={filters.quantity || {}}
                            onChange={handleFilterChange}
                            filterType="numeric"
                        />
                    </div>
                ),
                cell: ({ row }) => {
                    const qty = row.original.quantity ?? "N/A";
                    return (
                        <span
                            className={
                                qty < 0 ? "text-red-500" : "text-gray-700"
                            }
                        >
                            {qty}
                        </span>
                    );
                },
                enableSorting: false,
                meta: { responsive: true },
            },
            ...(showStockId
                ? [
                      {
                          accessorKey: "stock_id",
                          header: "Stock ID",
                          cell: ({ row }) => row.original.stock_id ?? "N/A",
                          enableSorting: true,
                          meta: { responsive: true },
                      },
                  ]
                : []),
            ...(showBatchNumber
                ? [
                      {
                          accessorKey: "batch_number",
                          header: "Batch Number",
                          cell: ({ row }) => row.original.batch_number ?? "N/A",
                          enableSorting: true,
                          meta: { responsive: true },
                      },
                  ]
                : []),
            ...(showParty
                ? [
                      {
                          accessorFn: (row) => row.party?.name ?? "N/A",
                          id: "party",
                          header: () => (
                              <div className="flex items-center gap-2">
                                  Party
                                  <FilterDropdown
                                      field="party"
                                      options={partyOptions}
                                      selectedValues={filters.party || []}
                                      onChange={handleFilterChange}
                                      filterType="checkbox"
                                  />
                              </div>
                          ),
                          cell: ({ row }) => row.original.party?.name ?? "N/A",
                          enableSorting: false,
                          meta: { responsive: true },
                      },
                  ]
                : []),
            ...(showCreatedBy
                ? [
                      {
                          accessorFn: (row) => row.stock_by?.name ?? "N/A",
                          id: "created_by",
                          header: () => (
                              <div className="flex items-center gap-2">
                                  Created By
                                  <FilterDropdown
                                      field="created_by"
                                      options={createdByOptions}
                                      selectedValues={filters.created_by || []}
                                      onChange={handleFilterChange}
                                      filterType="checkbox"
                                  />
                              </div>
                          ),
                          cell: ({ row }) =>
                              row.original.stock_by?.name ?? "N/A",
                          enableSorting: false,
                          meta: { responsive: true },
                      },
                  ]
                : []),
            ...(showReferenceType
                ? [
                      {
                          accessorKey: "reference_type",
                          header: () => (
                              <div className="flex items-center gap-2">
                                  Reference Type
                                  <FilterDropdown
                                      field="reference_type"
                                      options={referenceTypeOptions}
                                      selectedValues={
                                          filters.reference_type || []
                                      }
                                      onChange={handleFilterChange}
                                      filterType="checkbox"
                                  />
                              </div>
                          ),
                          cell: ({ row }) =>
                              row.original.reference_type ?? "N/A",
                          enableSorting: false,
                          meta: { responsive: true },
                      },
                  ]
                : []),
            {
                id: "reference",
                header: "Reference",
                accessorFn: (row) => {
                    switch (row.reference_type) {
                        case "sale":
                            return row.reference?.invoice_number ?? "N/A";
                        case "purchase":
                            return row.reference?.invoice ?? "N/A";
                        case "return":
                            return (
                                row.reference?.return_invoice_number ?? "N/A"
                            );
                        case "stock_adjustment":
                            return row.reference?.adjustment_number ?? "N/A";
                        case "quick_purchase":
                            return row.reference?.invoice ?? "N/A";
                        case "damage":
                        case "stock_transfer":
                        case "opening_stock":
                        case "bulk_update":
                            return "N/A";
                        default:
                            return "N/A";
                    }
                },
                enableSorting: false,
                meta: { responsive: true },
            },
            ...(showWarehouse
                ? [
                      {
                          accessorFn: (row) => row.warehouse?.name ?? "N/A",
                          id: "warehouse",
                          header: () => (
                              <div className="flex items-center gap-2">
                                  Warehouse
                                  <FilterDropdown
                                      field="warehouse"
                                      options={warehouseOptions}
                                      selectedValues={filters.warehouse || []}
                                      onChange={handleFilterChange}
                                      filterType="checkbox"
                                  />
                              </div>
                          ),
                          enableSorting: false,
                          meta: { responsive: true },
                      },
                  ]
                : []),
            ...(showRack
                ? [
                      {
                          accessorFn: (row) => row.racks?.name ?? "N/A",
                          id: "rack",
                          header: () => (
                              <div className="flex items-center gap-2">
                                  Rack
                                  <FilterDropdown
                                      field="rack"
                                      options={rackOptions}
                                      selectedValues={filters.rack || []}
                                      onChange={handleFilterChange}
                                      filterType="checkbox"
                                  />
                              </div>
                          ),
                          enableSorting: false,
                          meta: { responsive: true },
                      },
                  ]
                : []),
            ...(showAction
                ? [
                      {
                          accessorKey: "action",
                          header: "Action",
                          cell: ({ row }) => (
                              <div className="flex flex-col sm:flex-row gap-2">
                                  {/* <button
                                      className="text-red-500 hover:text-red-700 sm:text-sm text-xs"
                                      onClick={() =>
                                          openDeleteModal(row.original)
                                      }
                                      title="Delete"
                                  >
                                      <Icon
                                          icon="mdi:delete"
                                          className="h-5 w-5"
                                      />
                                  </button> */}
                              </div>
                          ),
                          meta: { responsive: true },
                      },
                  ]
                : []),
        ].flat();
        return baseColumns.filter(Boolean);
    }, [
        stockTrackings,
        filters,
        permissions,
        selectedRows,
        showBranch,
        showProduct,
        showVariation,
        showSize,
        showColor,
        showB2BPrice,
        showB2CPrice,
        showCostPrice,
        showStockId,
        showBatchNumber,
        showReferenceType,
        showQuantity,
        showWarehouse,
        showRack,
        showCreatedBy,
        showParty,
        showAction,
    ]);

    // filteredData useMemo
    const filteredData = useMemo(() => {
        let filtered = stockTrackings;

        if (filters.branch?.length > 0) {
            filtered = filtered.filter((row) =>
                filters.branch.includes(row.branch?.name ?? "N/A")
            );
        }
        if (filters.product?.length > 0) {
            filtered = filtered.filter((row) =>
                filters.product.includes(row.product?.name ?? "N/A")
            );
        }
        if (filters.variation?.length > 0) {
            filtered = filtered.filter((row) =>
                filters.variation.includes(
                    row.variation?.variation_name ?? "N/A"
                )
            );
        }

        if (filters.size?.length > 0) {
            filtered = filtered.filter((row) =>
                filters.size.includes(
                    row.variation?.variation_size?.size ?? "N/A"
                )
            );
        }
        if (filters.color?.length > 0) {
            filtered = filtered.filter((row) =>
                filters.color.includes(row.variation?.color_name?.name ?? "N/A")
            );
        }

        if (filters.party?.length > 0) {
            filtered = filtered.filter((row) =>
                filters.party.includes(row.party?.name ?? "N/A")
            );
        }
        if (filters.created_by?.length > 0) {
            filtered = filtered.filter((row) =>
                filters.created_by.includes(row.stock_by?.name ?? "N/A")
            );
        }
        if (filters.b2b_price?.start) {
            filtered = filtered.filter((row) => {
                try {
                    const price = parseFloat(row.variation?.b2b_price) || 0;
                    const start = parseFloat(filters.b2b_price.start);
                    const end = parseFloat(filters.b2b_price.end);
                    const type = filters.b2b_price.type || "between";

                    switch (type) {
                        case "exact":
                            return price === start;
                        case "less":
                            return price < start;
                        case "greater":
                            return price > start;
                        case "between":
                            return end && price >= start && price <= end;
                        default:
                            return true;
                    }
                } catch (error) {
                    return false;
                }
            });
        }
        if (filters.b2c_price?.start) {
            filtered = filtered.filter((row) => {
                try {
                    const price = parseFloat(row.variation?.b2c_price) || 0;
                    const start = parseFloat(filters.b2c_price.start);
                    const end = parseFloat(filters.b2c_price.end);
                    const type = filters.b2c_price.type || "between";

                    switch (type) {
                        case "exact":
                            return price === start;
                        case "less":
                            return price < start;
                        case "greater":
                            return price > start;
                        case "between":
                            return end && price >= start && price <= end;
                        default:
                            return true;
                    }
                } catch (error) {
                    return false;
                }
            });
        }
        if (filters.cost_price?.start) {
            filtered = filtered.filter((row) => {
                try {
                    const price = parseFloat(row.variation?.cost_price) || 0;
                    const start = parseFloat(filters.cost_price.start);
                    const end = parseFloat(filters.cost_price.end);
                    const type = filters.cost_price.type || "between";

                    switch (type) {
                        case "exact":
                            return price === start;
                        case "less":
                            return price < start;
                        case "greater":
                            return price > start;
                        case "between":
                            return end && price >= start && price <= end;
                        default:
                            return true;
                    }
                } catch (error) {
                    return false;
                }
            });
        }
        if (filters.reference_type?.length > 0) {
            filtered = filtered.filter((row) =>
                filters.reference_type.includes(row.reference_type ?? "N/A")
            );
        }
        if (filters.warehouse?.length > 0) {
            filtered = filtered.filter((row) =>
                filters.warehouse.includes(row.warehouse?.name ?? "N/A")
            );
        }
        if (filters.rack?.length > 0) {
            filtered = filtered.filter((row) =>
                filters.rack.includes(row.racks?.name ?? "N/A")
            );
        }

        // Number filter for quantity
        if (filters.quantity?.start) {
            filtered = filtered.filter((row) => {
                try {
                    const qty = row.quantity;
                    const start = filters.quantity.start;
                    const end = filters.quantity.end;
                    const type = filters.quantity.type || "between";

                    switch (type) {
                        case "exact":
                            return qty === start;
                        case "less":
                            return qty < start;
                        case "greater":
                            return qty > start;
                        case "between":
                            return end && qty >= start && qty <= end;
                        default:
                            return true;
                    }
                } catch (error) {
                    return false;
                }
            });
        }

        // Global filter
        if (globalFilter) {
            const lowercasedFilter = globalFilter.toLowerCase();
            filtered = filtered.filter((row) => {
                return (
                    String(row.id).toLowerCase().includes(lowercasedFilter) ||
                    String(row.branch?.name ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.product?.name ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.variation?.variation_name ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.variation?.variation_size?.size ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.variation?.color_name?.name ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.variation?.b2b_price ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.variation?.b2c_price ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.variation?.cost_price ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.stock_id ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.batch_number ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.reference_type ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.reference?.invoice_number ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.quantity ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.party?.name ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.stock_by?.name ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.warehouse?.name ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.racks?.name ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter)
                );
            });
        }

        setTotalStockTrackingsCount(filtered.length);
        return filtered;
    }, [globalFilter, stockTrackings, filters]);

    // react table create
    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            sorting,
            pagination,
            globalFilter,
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    // delete functionality
    const handleDelete = async (id) => {
        try {
            setIsLoading(true);

            await new Promise((resolve) => {
                router.delete(`/stock-tracking/delete/${id}`, {
                    onSuccess: () => {
                        toast.success("Stock Tracking Deleted Successfully");
                        setIsModalOpen(false);
                        router.reload({ only: ["stockTrackings"] });
                        resolve();
                    },
                    onError: () => {
                        setIsModalOpen(false);
                        resolve();
                    },
                });
            });
        } catch (error) {
            // handle error
        } finally {
            setIsLoading(false);
        }
    };

    const openDeleteModal = (stockTracking) => {
        setSelectedStockTrackingId(stockTracking.id);
        setIsModalOpen(true);
    };

    const handleModuleIsOngoing = () => {
        toast.success("This Module is Work in Progress");
    };

    return (
        <MainLayouts>
            <Head title="Stock Tracking Page" />
            <h2 className="mb-4 text-xl font-bold">Stock Tracking Page</h2>

            <div className="p-4">
                <div className="mb-4">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                        <div className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={globalFilter}
                                onChange={(e) =>
                                    setGlobalFilter(e.target.value)
                                }
                                placeholder="Search..."
                                className="border rounded-md p-1 w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            />
                            <div className="relative">
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    selectsStart
                                    startDate={startDate}
                                    endDate={endDate}
                                    placeholderText="Start Date"
                                    className="border rounded-md p-1 w-full sm:w-40 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                    dateFormat="yyyy-MM-dd"
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    popperClassName="custom-datepicker-popper z-[60]"
                                    popperPlacement="bottom-start"
                                    yearDropdownItemNumber={15}
                                    scrollableYearDropdown
                                />
                                <Icon
                                    icon="mdi:calendar"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                                />
                            </div>
                            <div className="relative">
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    selectsEnd
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={startDate}
                                    placeholderText="End Date"
                                    className="border rounded-md p-1 w-full sm:w-40 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                    dateFormat="yyyy-MM-dd"
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    popperClassName="custom-datepicker-popper z-[60]"
                                    popperPlacement="bottom-start"
                                    yearDropdownItemNumber={15}
                                    scrollableYearDropdown
                                />
                                <Icon
                                    icon="mdi:calendar"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                                />
                            </div>
                            {(startDate || endDate) && (
                                <button
                                    onClick={handleClearDateFilter}
                                    className="px-4 py-1 bg-primary text-white rounded-sm hover:bg-secondary text-sm"
                                >
                                    Clear Dates
                                </button>
                            )}
                        </div>
                        <div
                            className="flex gap-2 items-center"
                            ref={dropdownRef}
                        >
                            {selectedRows.length > 0 && (
                                <div className="relative action-dropdown">
                                    <button
                                        onClick={() =>
                                            setIsActionDropdownOpen(
                                                !isActionDropdownOpen
                                            )
                                        }
                                        className="py-1.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg text-sm font-semibold tracking-wide"
                                        title="Actions"
                                    >
                                        <span>Actions</span>
                                        <Icon
                                            icon={
                                                isActionDropdownOpen
                                                    ? "mdi:chevron-down"
                                                    : "mdi:chevron-right"
                                            }
                                            className="h-5 w-5 transition-transform duration-300"
                                        />
                                    </button>
                                    {isActionDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 transform transition-all duration-200 ease-in-out scale-95 opacity-0 animate-[dropdown_0.2s_ease-in-out_forwards]">
                                            <div className="py-2">
                                                {permissions.includes(
                                                    "stock-tracking.delete"
                                                ) && (
                                                    <button
                                                        onClick={() => {
                                                            handleModuleIsOngoing();
                                                            setIsActionDropdownOpen(
                                                                false
                                                            );
                                                        }}
                                                        className="block w-full text-left px-5 py-3 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 font-medium flex items-center gap-3"
                                                    >
                                                        <Icon
                                                            icon="mdi:delete"
                                                            className="h-5 w-5"
                                                        />
                                                        Delete (
                                                        {selectedRows.length})
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <button
                                onClick={handlePrint}
                                className="py-1 px-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
                                title="Print Table"
                            >
                                <Icon icon="mdi:printer" className="h-5 w-5" />
                            </button>
                            <button
                                onClick={exportToPDF}
                                className="py-1 px-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
                                title="Export to PDF"
                            >
                                <Icon
                                    icon="mdi:file-pdf-box"
                                    className="h-5 w-5"
                                />
                            </button>
                            <button
                                onClick={exportToExcel}
                                className="py-1 px-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200"
                                title="Export to Excel"
                            >
                                <Icon
                                    icon="mdi:file-excel"
                                    className="h-5 w-5"
                                />
                            </button>
                            <select
                                value={pagination.pageSize}
                                onChange={(e) => {
                                    table.setPageSize(Number(e.target.value));
                                }}
                                className="border rounded-md p-1 w-full  sm:w-20 text-sm"
                            >
                                {[10, 20, 50, 100].map((pageSize) => (
                                    <option key={pageSize} value={pageSize}>
                                        Show {pageSize}
                                    </option>
                                ))}
                            </select>
                            <ThreeDotMenu
                                fields={stockTrackingManageTableFields}
                                onFieldChange={handleFieldChange}
                            />
                        </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">
                            Total Stock Trackings: {totalStockTrackingsCount}
                        </span>
                        <div
                            className="relative"
                            onMouseEnter={() => setIsTooltipOpen(true)}
                            onMouseLeave={() => setIsTooltipOpen(false)}
                        >
                            <button className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors duration-200 shadow-sm">
                                <Icon icon="mdi:help" className="h-3 w-3" />
                            </button>
                            {isTooltipOpen && (
                                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-600 animate-[fadeIn_0.2s_ease-in-out]">
                                    Just This month data load. you can filter
                                    all data using date field.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto w-full">
                    <table className="min-w-max bg-white shadow rounded-lg table-auto">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr
                                    key={headerGroup.id}
                                    className="bg-gray-100"
                                >
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className={`p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-gray-600 ${
                                                header.column.columnDef.meta
                                                    ?.responsive
                                                    ? ""
                                                    : "hidden sm:table-cell"
                                            }`}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <div className="flex items-center">
                                                {flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext()
                                                )}
                                                {header.column.getCanSort() && (
                                                    <span className="ml-2">
                                                        {header.column.getIsSorted() ===
                                                        "asc" ? (
                                                            <Icon
                                                                icon="mdi:arrow-up"
                                                                className="h-4 w-4"
                                                            />
                                                        ) : header.column.getIsSorted() ===
                                                          "desc" ? (
                                                            <Icon
                                                                icon="mdi:arrow-down"
                                                                className="h-4 w-4"
                                                            />
                                                        ) : (
                                                            <Icon
                                                                icon="mdi:sort"
                                                                className="h-4 w-4"
                                                            />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody
                            className={`transition-all duration-300 ${
                                isLoading ? "opacity-50" : "opacity-100"
                            }`}
                        >
                            {table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b hover:bg-gray-50 text-xs sm:text-sm transition-opacity duration-300"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className={`p-2 sm:p-4 text-gray-700 ${
                                                cell.column.columnDef.meta
                                                    ?.responsive
                                                    ? ""
                                                    : "hidden sm:table-cell"
                                            }`}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-100">
                                {table
                                    .getHeaderGroups()[0]
                                    .headers.map((header) => (
                                        <td
                                            key={header.id}
                                            className={`p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-gray-600 ${
                                                header.column.columnDef.meta
                                                    ?.responsive
                                                    ? ""
                                                    : "hidden sm:table-cell"
                                            }`}
                                        >
                                            {header.column.columnDef.footer
                                                ? flexRender(
                                                      header.column.columnDef
                                                          .footer,
                                                      header.getContext()
                                                  )
                                                : ""}
                                        </td>
                                    ))}
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 text-sm"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 text-sm"
                        >
                            Next
                        </button>
                    </div>
                    <span className="text-sm">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </span>
                </div>

                {/* Delete Modal */}
                <DeleteConfirmationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleDelete}
                    itemId={selectedStockTrackingId}
                />
            </div>
        </MainLayouts>
    );
};

export default StockTracking;
