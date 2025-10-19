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

const WarrantyPage = () => {
    const { props } = usePage();
    // console.log(props);
    const { warranties, auth, pos_settings, success, error } = props;
    // console.log("warranties", warranties);
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
        customer: [],
        product: [],
        color: [],
        size: [],
        duration: [],
        start_date: [],
        end_date: [],
        status: [],
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSaleId, setSelectedSaleId] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
    const [isTooltipOpen, setIsTooltipOpen] = useState(false);

    const [totalWarrantiesCount, setTotalWarrantiesCount] = useState(
        warranties.length
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
        warrantyManageTableFields,
        handleFieldChange,
        showInvoice,
        showCustomer,
        showProduct,
        showColor,
        showSize,
        showDuration,
        showStartDate,
        showEndDate,
        showStatus,
        showAction,
    } = useTableFieldHideShow();

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
                        case "invoice_number":
                            return originalRow.sale?.invoice_number || "N/A";
                        case "customer":
                            return originalRow.sale?.customer?.name ?? "N/A";
                        case "product":
                            return originalRow.product?.name ?? "N/A";
                        case "color":
                            return (
                                originalRow.variant?.color_name?.name ?? "N/A"
                            );
                        case "size":
                            return (
                                originalRow.variant?.variation_size?.size ??
                                "N/A"
                            );
                        case "duration":
                            return String(originalRow.duration || "N/A");
                        case "start_date":
                            return originalRow.start_date || "N/A";
                        case "end_date":
                            return originalRow.end_date || "N/A";
                        case "status":
                            return String(originalRow.status || "N/A");
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
        if (filters.customer.length)
            filterText += `Customer: ${filters.customer.join(", ")}, `;
        if (filters.product.length)
            filterText += `Product: ${filters.product.join(", ")}, `;
        if (filters.color.length)
            filterText += `Color: ${filters.color.join(", ")}, `;
        if (filters.size.length)
            filterText += `Size: ${filters.size.join(", ")}, `;
        if (filters.duration.length)
            filterText += `Duration: ${filters.duration.join(", ")}, `;
        if (filters.status.length)
            filterText += `Status: ${filters.status.join(", ")}, `;

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
                    <title>Warranty Report</title>
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
                    <h1>Warranty Report</h1>
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

    // PDF Export function (SalesTable-এর মতো ইমপ্লিমেন্ট)
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
                        case "invoice_number":
                            return originalRow.sale?.invoice_number || "N/A";
                        case "customer":
                            return originalRow.sale?.customer?.name ?? "N/A";
                        case "product":
                            return originalRow.product?.name ?? "N/A";
                        case "color":
                            return (
                                originalRow.variant?.color_name?.name ?? "N/A"
                            );
                        case "size":
                            return (
                                originalRow.variant?.variation_size?.size ??
                                "N/A"
                            );
                        case "duration":
                            return String(originalRow.duration || "N/A");
                        case "start_date":
                            return originalRow.start_date || "N/A";
                        case "end_date":
                            return originalRow.end_date || "N/A";
                        case "status":
                            return String(originalRow.status || "N/A");
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
        doc.text("Warranty Report", leftRightMargin, 15);

        // filter Status
        let filterText = "";
        if (globalFilter) filterText += `Search: ${globalFilter}, `;
        if (startDate && endDate)
            filterText += `Date: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}, `;
        if (filters.customer.length)
            filterText += `Customer: ${filters.customer.join(", ")}, `;
        if (filters.product.length)
            filterText += `Product: ${filters.product.join(", ")}, `;
        if (filters.color.length)
            filterText += `Color: ${filters.color.join(", ")}, `;
        if (filters.size.length)
            filterText += `Size: ${filters.size.join(", ")}, `;
        if (filters.duration.length)
            filterText += `Duration: ${filters.duration.join(", ")}, `;
        if (filters.status.length)
            filterText += `Status: ${filters.status.join(", ")}, `;
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
            `warranty_report_${new Date().toISOString().slice(0, 10)}.pdf`
        );
    };

    // excel export (SalesTable-এর মতো ইমপ্লিমেন্ট)
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
                        case "invoice_number":
                            return originalRow.sale?.invoice_number || "N/A";
                        case "customer":
                            return originalRow.sale?.customer?.name ?? "N/A";
                        case "product":
                            return originalRow.product?.name ?? "N/A";
                        case "color":
                            return (
                                originalRow.variant?.color_name?.name ?? "N/A"
                            );
                        case "size":
                            return (
                                originalRow.variant?.variation_size?.size ??
                                "N/A"
                            );
                        case "duration":
                            return String(originalRow.duration || "N/A");
                        case "start_date":
                            return originalRow.start_date || "N/A";
                        case "end_date":
                            return originalRow.end_date || "N/A";
                        case "status":
                            return String(originalRow.status || "N/A");
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
        if (filters.customer.length)
            filterText += `Customer: ${filters.customer.join(", ")}, `;
        if (filters.product.length)
            filterText += `Product: ${filters.product.join(", ")}, `;
        if (filters.color.length)
            filterText += `Color: ${filters.color.join(", ")}, `;
        if (filters.size.length)
            filterText += `Size: ${filters.size.join(", ")}, `;
        if (filters.duration.length)
            filterText += `Duration: ${filters.duration.join(", ")}, `;
        if (filters.status.length)
            filterText += `Status: ${filters.status.join(", ")}, `;

        // Create Excel data
        const wsData = [
            ["Warranty Report"], // Header
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
        XLSX.utils.book_append_sheet(wb, ws, "Warranty Report");

        // Generate and download Excel file
        XLSX.writeFile(
            wb,
            `warranty_report_${new Date().toISOString().slice(0, 10)}.xlsx`
        );
    };

    // Columns useMemo update
    const columns = useMemo(() => {
        // Generate options correctly
        const customerOptions = [
            ...new Set(
                warranties.map((row) => row.sale?.customer?.name ?? "N/A")
            ),
        ];
        const productOptions = [
            ...new Set(warranties.map((row) => row.product?.name ?? "N/A")),
        ];
        const colorOptions = [
            ...new Set(
                warranties.map((row) => row.variant?.color_name?.name ?? "N/A")
            ),
        ];
        const sizeOptions = [
            ...new Set(
                warranties.map(
                    (row) => row.variant?.variation_size?.size ?? "N/A"
                )
            ),
        ];
        const durationOptions = [
            ...new Set(warranties.map((row) => row.duration ?? "N/A")),
        ]; // Assume duration field
        const statusOptions = [
            ...new Set(warranties.map((row) => row.status ?? "N/A")),
        ]; // Assume status field

        // After states, before useMemo
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
            // Move outside too
            setFilters((prev) => ({ ...prev, [field]: values }));
        };

        const baseColumns = [
            // Select column (existing)
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
                cell: ({ row, cell }) => {
                    console.log("Cell object:", cell); // Log the cell object
                    console.log("Row object:", row); // Existing row log
                    return (
                        <input
                            type="checkbox"
                            checked={selectedRows.includes(row.original.id)}
                            onChange={() => handleRowSelect(row.original.id)}
                            className="h-4 w-4"
                        />
                    );
                },
                meta: { responsive: true },
            },
            {
                id: "sl",
                header: "SL No",
                cell: ({ row }) => row.index + 1,
                meta: { responsive: true },
            },
            // Conditional columns with show/hide
            ...(showInvoice
                ? [
                      {
                          accessorKey: "invoice_number",
                          header: "Invoice Number",
                          cell: ({ row }) =>
                              row?.original?.sale?.invoice_number ? (
                                  <button
                                      onClick={() =>
                                          handleInvoiceClick(
                                              row.original.sale.id
                                          )
                                      }
                                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-xs transition-colors duration-200 sm:text-sm"
                                      title="Show Invoice"
                                  >
                                      #{row.original.sale.invoice_number}
                                  </button>
                              ) : (
                                  <span className="text-gray-500 text-sm sm:text-base">
                                      N/A
                                  </span>
                              ),
                          enableSorting: true,
                          meta: { responsive: true },
                      },
                  ]
                : []),
            ...(showCustomer
                ? [
                      {
                          accessorFn: (row) =>
                              row.sale?.customer?.name ?? "N/A",
                          id: "customer",
                          header: () => (
                              <div className="flex items-center gap-2">
                                  Customer
                                  <FilterDropdown
                                      field="customer"
                                      options={customerOptions}
                                      selectedValues={filters.customer || []}
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
            ...(showColor
                ? [
                      {
                          accessorFn: (row) =>
                              row.variant?.color_name?.name ?? "N/A",
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
            ...(showSize
                ? [
                      {
                          accessorFn: (row) =>
                              row.variant?.variation_size?.size ?? "N/A",
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
            ...(showDuration
                ? [
                      {
                          accessorKey: "duration", // Assume field name
                          header: () => (
                              <div className="flex items-center gap-2">
                                  Duration
                                  <FilterDropdown
                                      field="duration"
                                      options={durationOptions}
                                      selectedValues={filters.duration || []}
                                      onChange={handleFilterChange}
                                      filterType="checkbox"
                                  />
                              </div>
                          ),
                          cell: ({ row }) => row.original.duration ?? "N/A",
                          enableSorting: false,
                          meta: { responsive: true },
                      },
                  ]
                : []),
            ...(showStartDate
                ? [
                      {
                          accessorKey: "start_date",
                          header: () => (
                              <div className="flex items-center gap-2">
                                  Start Date
                                  <FilterDropdown
                                      field="start_date"
                                      options={[]}
                                      selectedValues={filters.start_date || {}}
                                      onChange={handleFilterChange}
                                      filterType="date"
                                  />
                              </div>
                          ),
                          cell: ({ row }) => row.original.start_date ?? "N/A",
                          enableSorting: false,
                          meta: { responsive: true },
                      },
                  ]
                : []),
            ...(showEndDate
                ? [
                      {
                          accessorKey: "end_date",
                          header: () => (
                              <div className="flex items-center gap-2 relative">
                                  End Date
                                  <FilterDropdown
                                      field="end_date"
                                      options={[]}
                                      selectedValues={filters.end_date || {}}
                                      onChange={handleFilterChange}
                                      filterType="date"
                                  />
                              </div>
                          ),
                          cell: ({ row }) => row.original.end_date ?? "N/A",
                          enableSorting: false,
                          meta: { responsive: true },
                      },
                  ]
                : []),
            ...(showStatus
                ? [
                      {
                          accessorKey: "status", // Assume field name
                          header: () => (
                              <div className="flex items-center gap-2">
                                  Status
                                  <FilterDropdown
                                      field="status"
                                      options={statusOptions}
                                      selectedValues={filters.status || []}
                                      onChange={handleFilterChange}
                                      filterType="checkbox"
                                  />
                              </div>
                          ),
                          cell: ({ row }) => row.original.status ?? "N/A",
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
                                  {/* <h2>hello </h2> */}
                                  <button
                                      className="text-blue-500 hover:text-blue-700 sm:text-sm text-xs"
                                      onClick={() =>
                                          handleWarrantyCard(row.original.id)
                                      }
                                      title="warranty"
                                  >
                                      <Icon
                                          icon="fa7-solid:file-invoice"
                                          className="h-5 w-5"
                                      />
                                  </button>

                                  <button
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
                                  </button>
                              </div>
                          ),
                          meta: { responsive: true },
                      },
                  ]
                : []),
        ].flat(); // Flatten conditional arrays
        return baseColumns.filter(Boolean);
    }, [
        warranties,
        filters,
        permissions,
        selectedRows,
        showInvoice,
        showCustomer,
        showProduct,
        showColor,
        showSize,
        showDuration,
        showStartDate,
        showEndDate,
        showStatus,
        showAction,
    ]);

    // filteredData useMemo update (Warranty-specific filters)
    const filteredData = useMemo(() => {
        // setIsLoading(true);
        let filtered = warranties;

        // Existing filters...
        if (filters.customer?.length > 0) {
            filtered = filtered.filter((row) =>
                filters.customer.includes(row.sale?.customer?.name ?? "N/A")
            );
        }
        if (filters.product?.length > 0) {
            filtered = filtered.filter((row) =>
                filters.product.includes(row.product?.name ?? "N/A")
            );
        }
        if (filters.color?.length > 0) {
            // New
            filtered = filtered.filter((row) =>
                filters.color.includes(row.variant?.color_name?.name ?? "N/A")
            );
        }
        if (filters.size?.length > 0) {
            // New
            filtered = filtered.filter((row) =>
                filters.size.includes(
                    row.variant?.variation_size?.size ?? "N/A"
                )
            );
        }
        if (filters.duration?.length > 0) {
            // New
            filtered = filtered.filter((row) =>
                filters.duration.includes(row.duration ?? "N/A")
            );
        }
        if (filters.status?.length > 0) {
            filtered = filtered.filter((row) =>
                filters.status.includes(row.status ?? "N/A")
            );
        }

        // Date filter (existing, but adapt for start_date/end_date)
        if (filters.start_date?.start) {
            filtered = filtered.filter((row) => {
                try {
                    const warrantyStartDate = parseISO(row.start_date); // Use row.start_date
                    const start = filters.start_date.start;
                    const end = filters.start_date.end;
                    const type = filters.start_date.type || "between";

                    switch (type) {
                        case "exact":
                            return (
                                warrantyStartDate.toDateString() ===
                                start.toDateString()
                            );
                        case "before":
                            return warrantyStartDate < start;
                        case "after":
                            return warrantyStartDate > start;
                        case "between":
                            return (
                                end &&
                                isWithinInterval(warrantyStartDate, {
                                    start,
                                    end,
                                })
                            );
                        default:
                            return true;
                    }
                } catch (error) {
                    return false;
                }
            });
        }

        // Date filter (existing, but adapt for start_date/end_date)
        if (filters.end_date?.start) {
            filtered = filtered.filter((row) => {
                try {
                    const warrantyEndDate = parseISO(row.end_date);
                    const start = filters.end_date.start;
                    const end = filters.end_date.end;
                    const type = filters.end_date.type || "between";

                    switch (type) {
                        case "exact":
                            return (
                                warrantyStartDate.toDateString() ===
                                start.toDateString()
                            );
                        case "before":
                            return warrantyStartDate < start;
                        case "after":
                            return warrantyStartDate > start;
                        case "between":
                            return (
                                end &&
                                isWithinInterval(warrantyStartDate, {
                                    start,
                                    end,
                                })
                            );
                        default:
                            return true;
                    }
                } catch (error) {
                    return false;
                }
            });
        }

        // Global filter update (Warranty fields)
        if (globalFilter) {
            const lowercasedFilter = globalFilter.toLowerCase();
            filtered = filtered.filter((row) => {
                return (
                    String(row.id).toLowerCase().includes(lowercasedFilter) ||
                    String(row.sale?.invoice_number ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.sale?.customer?.name ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.product?.name ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.variant?.color_name?.name ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.variant?.variation_size?.size ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.duration ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.start_date ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.end_date ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter) ||
                    String(row.status ?? "")
                        .toLowerCase()
                        .includes(lowercasedFilter)
                );
            });
        }

        setTotalWarrantiesCount(filtered.length); // Update count
        return filtered;
    }, [globalFilter, warranties, filters]);

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

    // handle Invoice Function
    const handleInvoiceClick = (id) => {
        location.href = "/sale/invoice/" + id;
    };

    // delete functionality Implement
    const handleDelete = async (id) => {
        try {
            setIsLoading(true);

            await new Promise((resolve) => {
                router.delete(`/warranty/delete/${id}`, {
                    onSuccess: () => {
                        toast.success("Warranty Deleted Successfully");
                        setIsModalOpen(false);
                        router.reload({ only: ["warranties"] });
                        resolve();
                    },
                    onError: () => {
                        setIsModalOpen(false);
                        resolve();
                    },
                });
            });
        } catch (error) {
            // flash message error handle
        } finally {
            setIsLoading(false);
        }
    };

    const openDeleteModal = (warranty) => {
        console.log("warranty", warranty);
        setSelectedSaleId(warranty);
        setIsModalOpen(true);
    };

    const handleModuleIsOngoing = () => {
        toast.success("This Module is is Work in Progress");
    };

    const handleWarrantyCard = (id) => {
        location.href = "/warranty/card/" + id;
    };

    return (
        <MainLayouts>
            <Head title="Warranty Manage Page" />
            <h2 className="mb-4 text-xl font-bold">Warranty Manage Page</h2>

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
                                                    "pos-manage.delete"
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
                                fields={warrantyManageTableFields}
                                onFieldChange={handleFieldChange}
                            />
                        </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">
                            Total Sales: {totalWarrantiesCount}
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

                {/* duplicate invoice Modal  */}
                <DeleteConfirmationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleDelete}
                    itemId={selectedSaleId}
                />
            </div>
        </MainLayouts>
    );
};

export default WarrantyPage;
