import React, { useState, useMemo, useEffect, useRef } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
} from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { router, usePage } from "@inertiajs/react";
import DatePicker from "react-datepicker";
import { isWithinInterval, parseISO } from "date-fns";
import useTableFieldHideShow from "../hook/useTableFieldHideShow";
import ThreeDotMenu from "./ThreeDotMenu";
import FilterDropdown from "./FilterDropdown";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatHeaderText } from "../utils/formatHeaderText";
import * as XLSX from "xlsx";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import toast from "react-hot-toast";
import PaymentModal from "./PaymentModal";

const SalesTable = () => {
    const { props } = usePage();
    // console.log(props);
    const { sales, auth, pos_settings, success, error, accounts } = props;
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
        invoice_number: [],
        customer: [],
        receiveAccount: [],
        saleBy: [],
        status: [],
        saleStatus: [],
        courierStatus: [],
        orderType: [],
        quantity: {},
        sale_date: {},
        total: {},
        discount: {},
        tax: {},
        invoice_total: {},
        additional_charge_total: {},
        receivable: {},
        paid: {},
        due: {},
        total_purchase_cost: {},
        profit: {},
        payment_method: [],
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSaleId, setSelectedSaleId] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
    const [isTooltipOpen, setIsTooltipOpen] = useState(false);

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

    // filed hide and show
    const {
        saleManageTableFields,
        handleFieldChange,
        showInvoice,
        showCustomer,
        showQuantity,
        showDate,
        showTotal,
        showDiscount,
        showTax,
        showInvoiceTotal,
        showReceivable,
        showPaid,
        showDue,
        showPurchaseCost,
        showProfit,
        showReceiveAccount,
        showSaleBy,
        showStatus,
        showSaleStatus,
        showAction,
        showOrderType,
        showCourierStatus,
        showAdditionalCharge,
    } = useTableFieldHideShow();

    // handle print function
    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        const tableColumn = [];
        const tableRows = [];

        table.getHeaderGroups()[0].headers.forEach((header) => {
            if (header.id !== "action" && header.id !== "select") {
                const headerText =
                    typeof header.column.columnDef.header === "function"
                        ? formatHeaderText(header.id) // Use formatted header ID
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
                    console.log(cell);
                    if (cell.column.id === "action") return null;
                    const originalRow = row.original;
                    console.log(originalRow.grand_total);

                    switch (cell.column.id) {
                        case "id":
                            return String(row.index + 1);
                        case "invoice_number":
                            return originalRow.invoice_number || "N/A";
                        case "customer":
                            return originalRow.customer?.name ?? "N/A";
                        case "quantity":
                            return String(originalRow.quantity || 0);
                        case "sale_date":
                            return originalRow.sale_date || "N/A";
                        case "total":
                            return `${Number(
                                originalRow.product_total || 0
                            ).toFixed(2)}`;
                        case "discount":
                            return `${Number(
                                originalRow.actual_discount || 0
                            ).toFixed(2)}`;
                        case "tax":
                            return `${Number(originalRow.tax || 0).toFixed(2)}`;
                        case "invoice_total":
                            return `${Number(
                                originalRow.invoice_total || 0
                            ).toFixed(2)}`;
                        case "additional_charge_total":
                            return `${Number(
                                originalRow.additional_charge_total || 0
                            ).toFixed(2)}`;
                        case "grand_total":
                            return `${Number(
                                originalRow.grand_total || 0
                            ).toFixed(2)}`;
                        case "paid":
                            return `${Number(originalRow.paid || 0).toFixed(
                                2
                            )}`;
                        case "due":
                            return `${Number(originalRow.due || 0).toFixed(2)}`;
                        case "total_purchase_cost":
                            return `${Number(
                                originalRow.total_purchase_cost || 0
                            ).toFixed(2)}`;
                        case "profit":
                            return `${Number(originalRow.profit || 0).toFixed(
                                2
                            )}`;
                        case "receive_account":
                            const accounts = originalRow.account_receive;
                            if (
                                Array.isArray(accounts) &&
                                accounts.length > 0
                            ) {
                                return accounts
                                    .map(
                                        (account) =>
                                            account?.bank?.name ?? "N/A"
                                    )
                                    .join(", ");
                            } else {
                                return (
                                    originalRow.account_receive?.name ?? "N/A"
                                );
                            }
                        case "sale_by":
                            return originalRow.sale_by?.name ?? "N/A";
                        case "status":
                            return String(originalRow.status || "N/A");
                        case "order_status":
                            return String(originalRow.order_status || "N/A");
                        case "courier_status":
                            return String(originalRow.courier_status || "N/A");
                        case "order_type":
                            return String(originalRow?.order_type || "N/A");
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
        if (filters.receiveAccount.length)
            filterText += `Receive Account: ${filters.receiveAccount.join(
                ", "
            )}, `;
        if (filters.saleBy.length)
            filterText += `Sale By: ${filters.saleBy.join(", ")}, `;
        if (filters.status.length)
            filterText += `Status: ${filters.status.join(", ")}, `;
        if (filters.saleStatus.length)
            filterText += `Sale Status: ${filters.saleStatus.join(", ")}, `;
        if (filters.courierStatus.length)
            filterText += `Courier Status: ${filters.courierStatus.join(
                ", "
            )}, `;
        if (filters.orderType.length)
            filterText += `Order Type: ${filters.orderType.join(", ")}, `;

        // Dynamic settings based on column count
        const columnCount = tableColumn.length;
        const orientation = columnCount > 12 ? "landscape" : "portrait";
        let leftRightMargin = 20; // Default margin in mm
        let headerFontSize = 12; // Default header font size in px
        let bodyFontSize = 10; // Default body font size in px

        if (columnCount > 12) {
            leftRightMargin = 10;
            headerFontSize = 8;
            bodyFontSize = 6;
        } else if (columnCount >= 8) {
            leftRightMargin = 15;
            headerFontSize = 10;
            bodyFontSize = 8;
        }

        // Calculate column width dynamically
        const pageWidth = orientation === "landscape" ? 297 : 210; // A4 width in mm (landscape: 297mm, portrait: 210mm)
        const availableWidth = pageWidth - 2 * leftRightMargin;
        const columnWidth = availableWidth / columnCount;

        // HTML for print window
        const printContent = `
            <html>
                <head>
                    <title>Sales Report</title>
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
                    <h1>Sales Report</h1>
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

                    console.log(
                        `Row ${row.index + 1}, Column ${cell.column.id}:`,
                        originalRow
                    );

                    switch (cell.column.id) {
                        case "id":
                            return String(row.index + 1);
                        case "invoice_number":
                            return originalRow.invoice_number || "N/A";
                        case "customer":
                            return originalRow.customer?.name ?? "N/A";
                        case "quantity":
                            return String(originalRow.quantity || 0);
                        case "sale_date":
                            return originalRow.sale_date || "N/A";
                        case "total":
                            return `${Number(
                                originalRow.product_total || 0
                            ).toFixed(2)}`;
                        case "discount":
                            return `${Number(
                                originalRow.actual_discount || 0
                            ).toFixed(2)}`;
                        case "tax":
                            return `${Number(originalRow.tax || 0).toFixed(2)}`;
                        case "invoice_total":
                            return `${Number(
                                originalRow.invoice_total || 0
                            ).toFixed(2)}`;
                        case "additional_charge_total":
                            return `${Number(
                                originalRow.additional_charge_total || 0
                            ).toFixed(2)}`;
                        case "grand_total":
                            return `${Number(
                                originalRow.grand_total || 0
                            ).toFixed(2)}`;
                        case "paid":
                            return `${Number(originalRow.paid || 0).toFixed(
                                2
                            )}`;
                        case "due":
                            return `${Number(originalRow.due || 0).toFixed(2)}`;
                        case "total_purchase_cost":
                            return `${Number(
                                originalRow.total_purchase_cost || 0
                            ).toFixed(2)}`;
                        case "profit":
                            return `${Number(originalRow.profit || 0).toFixed(
                                2
                            )}`;
                        case "receive_account":
                            const accounts = originalRow.account_receive;
                            if (
                                Array.isArray(accounts) &&
                                accounts.length > 0
                            ) {
                                return accounts
                                    .map(
                                        (account) =>
                                            account?.bank?.name ?? "N/A"
                                    )
                                    .join(", ");
                            } else {
                                return (
                                    originalRow.account_receive?.name ?? "N/A"
                                );
                            }
                        case "sale_by":
                            return originalRow.sale_by?.name ?? "N/A";
                        case "status":
                            return String(originalRow.status || "N/A");
                        case "order_status":
                            return String(originalRow.order_status || "N/A");
                        case "courier_status":
                            return String(originalRow.courier_status || "N/A");
                        case "order_type":
                            return String(originalRow.order_type || "N/A");
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
        doc.text("Sales Report", leftRightMargin, 15);

        // filter Status
        let filterText = "";
        if (globalFilter) filterText += `Search: ${globalFilter}, `;
        if (startDate && endDate)
            filterText += `Date: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}, `;
        if (filters.customer.length)
            filterText += `Customer: ${filters.customer.join(", ")}, `;
        if (filters.receiveAccount.length)
            filterText += `Receive Account: ${filters.receiveAccount.join(
                ", "
            )}, `;
        if (filters.saleBy.length)
            filterText += `Sale By: ${filters.saleBy.join(", ")}, `;
        if (filters.status.length)
            filterText += `Status: ${filters.status.join(", ")}, `;
        if (filters.saleStatus.length)
            filterText += `Sale Status: ${filters.saleStatus.join(", ")}, `;
        if (filters.courierStatus.length)
            filterText += `Courier Status: ${filters.courierStatus.join(
                ", "
            )}, `;
        if (filters.orderType.length)
            filterText += `Order Type: ${filters.orderType.join(", ")}, `;
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
        doc.save(`sales_report_${new Date().toISOString().slice(0, 10)}.pdf`);
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
                        case "id":
                            return String(row.index + 1);
                        case "invoice_number":
                            return originalRow.invoice_number || "N/A";
                        case "customer":
                            return originalRow.customer?.name ?? "N/A";
                        case "quantity":
                            return String(originalRow.quantity || 0);
                        case "sale_date":
                            return originalRow.sale_date || "N/A";
                        case "total":
                            return `${Number(
                                originalRow.product_total || 0
                            ).toFixed(2)}`;
                        case "discount":
                            return `${Number(
                                originalRow.actual_discount || 0
                            ).toFixed(2)}`;
                        case "tax":
                            return `${Number(originalRow.tax || 0).toFixed(2)}`;
                        case "invoice_total":
                            return `${Number(
                                originalRow.invoice_total || 0
                            ).toFixed(2)}`;
                        case "additional_charge_total":
                            return `${Number(
                                originalRow.additional_charge_total || 0
                            ).toFixed(2)}`;
                        case "grand_total":
                            return `${Number(
                                originalRow.grand_total || 0
                            ).toFixed(2)}`;
                        case "paid":
                            return `${Number(originalRow.paid || 0).toFixed(
                                2
                            )}`;
                        case "due":
                            return `${Number(originalRow.due || 0).toFixed(2)}`;
                        case "total_purchase_cost":
                            return `${Number(
                                originalRow.total_purchase_cost || 0
                            ).toFixed(2)}`;
                        case "profit":
                            return `${Number(originalRow.profit || 0).toFixed(
                                2
                            )}`;
                        case "receive_account":
                            const accounts = originalRow.account_receive;
                            if (
                                Array.isArray(accounts) &&
                                accounts.length > 0
                            ) {
                                return accounts
                                    .map(
                                        (account) =>
                                            account?.bank?.name ?? "N/A"
                                    )
                                    .join(", ");
                            } else {
                                return (
                                    originalRow.account_receive?.name ?? "N/A"
                                );
                            }
                        case "sale_by":
                            return originalRow.sale_by?.name ?? "N/A";
                        case "status":
                            return String(originalRow.status || "N/A");
                        case "order_status":
                            return String(originalRow.order_status || "N/A");
                        case "courier_status":
                            return String(originalRow.courier_status || "N/A");
                        case "order_type":
                            return String(originalRow.order_type || "N/A");
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
        if (filters.receiveAccount.length)
            filterText += `Receive Account: ${filters.receiveAccount.join(
                ", "
            )}, `;
        if (filters.saleBy.length)
            filterText += `Sale By: ${filters.saleBy.join(", ")}, `;
        if (filters.status.length)
            filterText += `Status: ${filters.status.join(", ")}, `;
        if (filters.saleStatus.length)
            filterText += `Sale Status: ${filters.saleStatus.join(", ")}, `;
        if (filters.courierStatus.length)
            filterText += `Courier Status: ${filters.courierStatus.join(
                ", "
            )}, `;
        if (filters.orderType.length)
            filterText += `Order Type: ${filters.orderType.join(", ")}, `;

        // Create Excel data
        const wsData = [
            ["Sales Report"], // Header
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
            wch: Math.max(header.length, 10), // Minimum width of 10 characters
        }));
        ws["!cols"] = colWidths;

        // Append worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "Sales Report");

        // Generate and download Excel file
        XLSX.writeFile(
            wb,
            `sales_report_${new Date().toISOString().slice(0, 10)}.xlsx`
        );
    };

    // console.log("permissions", permissions);
    // table Column
    const columns = useMemo(() => {
        const customerOptions = [
            ...new Set(sales.map((row) => row.customer?.name ?? "N/A")),
        ];
        const receiveAccountOptions = [
            ...new Set(
                sales.flatMap(
                    (row) =>
                        Array.isArray(row.account_receive)
                            ? row.account_receive.map(
                                  (account) => account?.bank?.name ?? "N/A"
                              )
                            : [row.account_receive?.name ?? "N/A"] // Fixed for single
                )
            ),
        ];
        const saleByOptions = [
            ...new Set(sales.map((row) => row.sale_by?.name ?? "N/A")),
        ];
        const statusOptions = [...new Set(sales.map((row) => row.status))];
        const saleStatusOptions = [
            ...new Set(sales.map((row) => row.order_status)),
        ];
        const courierStatusOptions = [
            ...new Set(sales.map((row) => row.courier_status)),
        ];
        const orderTypeOptions = [
            ...new Set(sales.map((row) => row.order_type)),
        ];
        // const paymentMethodOptions = [
        //     ...new Set(sales.map((row) => row.payment_method ?? "N/A")),
        // ];
        // const invoiceNumberOptions = [
        //     ...new Set(sales.map((row) => row.invoice_number ?? "N/A")),
        // ];

        const handleFilterChange = (field, values) => {
            setFilters((prev) => ({ ...prev, [field]: values }));
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
                accessorKey: "id",
                header: "SL No",
                cell: ({ row }) => {
                    console.log("Row Data:", row.original);
                    return row.index + 1;
                },
                meta: { responsive: true },
            },
            showInvoice && {
                accessorKey: "invoice_number",
                header: "Invoice Number",
                cell: ({ row }) =>
                    row?.original?.invoice_number ? (
                        <button
                            onClick={() => handleInvoiceClick(row.original.id)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-xs transition-colors duration-200 sm:text-sm"
                            title="Show Invoice"
                        >
                            #{row.original.invoice_number}
                        </button>
                    ) : (
                        <span className="text-gray-500 text-sm sm:text-base">
                            N/A
                        </span>
                    ),
                enableSorting: true,
                meta: { responsive: true },
            },
            showCustomer && {
                accessorFn: (row) => row.customer?.name ?? "N/A",
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
            showQuantity && {
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
                enableSorting: false,
                meta: { responsive: true },
            },
            showDate && {
                accessorKey: "sale_date",
                header: () => (
                    <div className="flex items-center gap-2">
                        Date
                        <FilterDropdown
                            field="sale_date"
                            options={[]}
                            selectedValues={filters.sale_date || {}}
                            onChange={handleFilterChange}
                            filterType="date"
                        />
                    </div>
                ),
                enableSorting: false,
                meta: { responsive: true },
            },
            showTotal && {
                accessorKey: "total",
                header: () => (
                    <div className="flex items-center gap-2">
                        Total
                        <FilterDropdown
                            field="total"
                            options={[]}
                            selectedValues={filters.total}
                            onChange={handleFilterChange}
                            filterType="numeric"
                        />
                    </div>
                ),
                enableSorting: false,
                cell: ({ row }) =>
                    `৳${Number(row.original.product_total).toFixed(2)}`,
                meta: { responsive: true },
                footer: ({ table }) =>
                    `৳${table
                        .getFilteredRowModel()
                        .rows.reduce(
                            (sum, row) =>
                                sum + Number(row.original.product_total),
                            0
                        )
                        .toFixed(2)}`,
            },
            showDiscount && {
                id: "discount",
                accessorFn: (row) => row.actual_discount,
                header: () => (
                    <div className="flex items-center gap-2">
                        Discount
                        <FilterDropdown
                            field="discount"
                            options={[]}
                            selectedValues={filters.discount}
                            onChange={handleFilterChange}
                            filterType="numeric"
                        />
                    </div>
                ),
                enableSorting: false,
                cell: ({ row }) =>
                    `৳${Number(row.original.actual_discount).toFixed(2)}`,
                meta: { responsive: false },
                footer: ({ table }) =>
                    `৳${table
                        .getFilteredRowModel()
                        .rows.reduce(
                            (sum, row) =>
                                sum + Number(row.original.actual_discount),
                            0
                        )
                        .toFixed(2)}`,
            },
            showTax && {
                accessorKey: "tax",
                header: () => (
                    <div className="flex items-center gap-2">
                        Tax
                        <FilterDropdown
                            field="tax"
                            options={[]}
                            selectedValues={filters.tax}
                            onChange={handleFilterChange}
                            filterType="numeric"
                        />
                    </div>
                ),
                enableSorting: false,
                cell: ({ row }) =>
                    `৳${Number(row.original.tax || 0).toFixed(2)}`,
                meta: { responsive: false },
                footer: ({ table }) =>
                    `৳${table
                        .getFilteredRowModel()
                        .rows.reduce(
                            (sum, row) => sum + Number(row.original.tax || 0),
                            0
                        )
                        .toFixed(2)}`,
            },
            showInvoiceTotal && {
                accessorKey: "invoice_total",
                header: () => (
                    <div className="flex items-center gap-2">
                        Invoice Total
                        <FilterDropdown
                            field="invoice_total"
                            options={[]}
                            selectedValues={filters.invoice_total}
                            onChange={handleFilterChange}
                            filterType="numeric"
                        />
                    </div>
                ),
                enableSorting: false,
                cell: ({ row }) =>
                    `৳${Number(row.original.invoice_total || 0).toFixed(2)}`,
                meta: { responsive: false },
                footer: ({ table }) =>
                    `৳${table
                        .getFilteredRowModel()
                        .rows.reduce(
                            (sum, row) =>
                                sum + Number(row.original.invoice_total || 0),
                            0
                        )
                        .toFixed(2)}`,
            },
            showAdditionalCharge && {
                accessorKey: "additional_charge_total",
                header: () => (
                    <div className="flex items-center gap-2">
                        Additional Charge
                        <FilterDropdown
                            field="additional_charge_total"
                            options={[]}
                            selectedValues={filters.additional_charge_total}
                            onChange={handleFilterChange}
                            filterType="numeric"
                        />
                    </div>
                ),
                enableSorting: false,
                cell: ({ row }) =>
                    `৳${Number(row.original.additional_charge_total).toFixed(
                        2
                    )}`,
                meta: { responsive: false },
                footer: ({ table }) =>
                    `৳${table
                        .getFilteredRowModel()
                        .rows.reduce(
                            (sum, row) =>
                                sum +
                                Number(row.original.additional_charge_total),
                            0
                        )
                        .toFixed(2)}`,
            },
            showReceivable && {
                accessorKey: "grand_total",
                header: () => (
                    <div className="flex items-center gap-2">
                        Receivable
                        <FilterDropdown
                            field="receivable"
                            options={[]}
                            selectedValues={filters.receivable}
                            onChange={handleFilterChange}
                            filterType="numeric"
                        />
                    </div>
                ),
                enableSorting: false,
                cell: ({ row }) =>
                    `৳${Number(row.original.grand_total).toFixed(2)}`,
                meta: { responsive: false },
                footer: ({ table }) =>
                    `৳${table
                        .getFilteredRowModel()
                        .rows.reduce(
                            (sum, row) =>
                                sum + Number(row.original.grand_total),
                            0
                        )
                        .toFixed(2)}`,
            },
            showPaid && {
                accessorKey: "paid",
                header: () => (
                    <div className="flex items-center gap-2">
                        Paid
                        <FilterDropdown
                            field="paid"
                            options={[]}
                            selectedValues={filters.paid}
                            onChange={handleFilterChange}
                            filterType="numeric"
                        />
                    </div>
                ),
                enableSorting: false,
                cell: ({ row }) => `৳${Number(row.original.paid).toFixed(2)}`,
                meta: { responsive: false },
                footer: ({ table }) =>
                    `৳${table
                        .getFilteredRowModel()
                        .rows.reduce(
                            (sum, row) => sum + Number(row.original.paid),
                            0
                        )
                        .toFixed(2)}`,
            },
            showDue && {
                accessorKey: "due",
                header: () => (
                    <div className="flex items-center gap-2">
                        Due
                        <FilterDropdown
                            field="due"
                            options={[]}
                            selectedValues={filters.due}
                            onChange={handleFilterChange}
                            filterType="numeric"
                        />
                    </div>
                ),
                enableSorting: false,
                cell: ({ row }) => `৳${Number(row.original.due).toFixed(2)}`,
                meta: { responsive: false },
                footer: ({ table }) =>
                    `৳${table
                        .getFilteredRowModel()
                        .rows.reduce(
                            (sum, row) => sum + Number(row.original.due),
                            0
                        )
                        .toFixed(2)}`,
            },
            showPurchaseCost && {
                accessorKey: "total_purchase_cost",
                header: () => (
                    <div className="flex items-center gap-2">
                        Purchase Cost
                        <FilterDropdown
                            field="total_purchase_cost"
                            options={[]}
                            selectedValues={filters.total_purchase_cost}
                            onChange={handleFilterChange}
                            filterType="numeric"
                        />
                    </div>
                ),
                enableSorting: false,
                cell: ({ row }) =>
                    `৳${Number(row.original.total_purchase_cost).toFixed(2)}`,
                meta: { responsive: false },
                footer: ({ table }) =>
                    `৳${table
                        .getFilteredRowModel()
                        .rows.reduce(
                            (sum, row) =>
                                sum + Number(row.original.total_purchase_cost),
                            0
                        )
                        .toFixed(2)}`,
            },
            showProfit && {
                accessorKey: "profit",
                header: () => (
                    <div className="flex items-center gap-2">
                        Profit/Loss
                        <FilterDropdown
                            field="profit"
                            options={[]}
                            selectedValues={filters.profit}
                            onChange={handleFilterChange}
                            filterType="numeric"
                        />
                    </div>
                ),
                enableSorting: false,
                cell: ({ row }) => (
                    <span
                        className={`${
                            Number(row.original.profit) < 0
                                ? "text-red-600"
                                : "text-gray-700"
                        }`}
                    >
                        ৳{Number(row.original.profit).toFixed(2)}
                    </span>
                ),
                meta: { responsive: false },
                footer: ({ table }) =>
                    `৳${table
                        .getFilteredRowModel()
                        .rows.reduce(
                            (sum, row) => sum + Number(row.original.profit),
                            0
                        )
                        .toFixed(2)}`,
            },
            showReceiveAccount && {
                accessorFn: (row) =>
                    Array.isArray(row.account_receive) &&
                    row.account_receive.length > 0
                        ? row.account_receive
                              .map((account) => account?.bank?.name ?? "N/A")
                              .join(", ")
                        : row.account_receive?.name ?? "N/A",
                id: "receive_account",
                header: () => (
                    <div className="flex items-center gap-2">
                        Receive Account
                        <FilterDropdown
                            field="receiveAccount"
                            options={receiveAccountOptions}
                            selectedValues={filters.receiveAccount}
                            onChange={handleFilterChange}
                            filterType="checkbox"
                        />
                    </div>
                ),
                enableSorting: false,
                meta: { responsive: false },
            },
            showSaleBy && {
                accessorFn: (row) => row.sale_by?.name ?? "N/A",
                id: "sale_by",
                header: () => (
                    <div className="flex items-center gap-2">
                        Sale By
                        <FilterDropdown
                            field="saleBy"
                            options={saleByOptions}
                            selectedValues={filters.saleBy}
                            onChange={handleFilterChange}
                            filterType="checkbox"
                        />
                    </div>
                ),
                enableSorting: false,
                meta: { responsive: false },
            },
            showStatus && {
                accessorKey: "status",
                header: () => (
                    <div className="flex items-center gap-2">
                        Status
                        <FilterDropdown
                            field="status"
                            options={statusOptions}
                            selectedValues={filters.status}
                            onChange={handleFilterChange}
                            filterType="checkbox"
                        />
                    </div>
                ),
                enableSorting: false,
                meta: { responsive: true },
            },
            showSaleStatus && {
                accessorKey: "order_status",
                header: () => (
                    <div className="flex items-center gap-2">
                        Sale Status
                        <FilterDropdown
                            field="saleStatus"
                            options={saleStatusOptions}
                            selectedValues={filters.saleStatus}
                            onChange={handleFilterChange}
                            filterType="checkbox"
                        />
                    </div>
                ),
                enableSorting: false,
                meta: { responsive: true },
            },
            showCourierStatus && {
                accessorKey: "courier_status",
                header: () => (
                    <div className="flex items-center gap-2">
                        Courier Status
                        <FilterDropdown
                            field="courierStatus"
                            options={courierStatusOptions}
                            selectedValues={filters.courierStatus}
                            onChange={handleFilterChange}
                            filterType="checkbox"
                        />
                    </div>
                ),
                enableSorting: false,
                meta: { responsive: true },
            },
            showOrderType && {
                accessorKey: "order_type",
                header: () => (
                    <div className="flex items-center gap-2">
                        Order Type
                        <FilterDropdown
                            field="orderType"
                            options={orderTypeOptions}
                            selectedValues={filters.orderType}
                            onChange={handleFilterChange}
                            filterType="checkbox"
                        />
                    </div>
                ),
                enableSorting: false,
                meta: { responsive: true },
            },
            showAction && {
                accessorKey: "action",
                header: "Action",
                cell: ({ row }) => (
                    <div className="flex flex-col sm:flex-row gap-2">
                        {row.original?.order_status === "draft" ? (
                            <>
                                {permissions.includes("pos-manage.edit") && (
                                    <button
                                        className="text-green-500 hover:text-green-700 sm:text-sm text-xs"
                                        onClick={() =>
                                            handleEditClick(row.original.id)
                                        }
                                        title="Edit"
                                    >
                                        <Icon
                                            icon="mdi:pencil"
                                            className="h-5 w-5"
                                        />
                                    </button>
                                )}
                                {permissions.includes(
                                    "pos-manage.duplicate.invoice"
                                ) && (
                                    <button
                                        className="text-gray-500 hover:text-gray-700 sm:text-sm text-xs"
                                        onClick={() =>
                                            handleDuplicateInvoiceClick(
                                                row.original.id
                                            )
                                        }
                                        title="Duplicate Invoice"
                                    >
                                        <Icon
                                            icon="mdi:content-duplicate"
                                            className="h-5 w-5"
                                        />
                                    </button>
                                )}
                                {permissions.includes("pos-manage.delete") && (
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
                                )}
                            </>
                        ) : (
                            <>
                                {permissions.includes("pos-manage.invoice") && (
                                    <button
                                        className="text-blue-500 hover:text-blue-700 sm:text-sm text-xs"
                                        onClick={() =>
                                            handleInvoiceClick(row.original.id)
                                        }
                                        title="Invoice"
                                    >
                                        <Icon
                                            icon="fa7-solid:file-invoice"
                                            className="h-5 w-5"
                                        />
                                    </button>
                                )}

                                {row.original?.order_status !== "return" &&
                                    permissions.includes(
                                        "pos.manage.return"
                                    ) && (
                                        <button
                                            className="text-yellow-500 hover:text-yellow-700 sm:text-sm text-xs"
                                            onClick={() =>
                                                handleReturnClick(
                                                    row.original.id
                                                )
                                            }
                                            title="Return"
                                        >
                                            <Icon
                                                icon="mdi:undo"
                                                className="h-5 w-5"
                                            />
                                        </button>
                                    )}

                                {permissions.includes("pos-manage.edit") && (
                                    <button
                                        className="text-green-500 hover:text-green-700 sm:text-sm text-xs"
                                        onClick={() =>
                                            handleEditClick(row.original.id)
                                        }
                                        title="Edit"
                                    >
                                        <Icon
                                            icon="mdi:pencil"
                                            className="h-5 w-5"
                                        />
                                    </button>
                                )}

                                {pos_settings.invoice_payment === 1 &&
                                    row.original?.due > 0 && (
                                        <button
                                            className="text-purple-500 hover:text-purple-700 sm:text-sm text-xs"
                                            onClick={() =>
                                                handlePaymentClick(
                                                    row?.original
                                                )
                                            }
                                            title="Payment"
                                        >
                                            <Icon
                                                icon="fluent:payment-16-filled"
                                                className="h-5 w-5"
                                            />
                                        </button>
                                    )}
                                {permissions.includes(
                                    "pos-manage.duplicate.invoice"
                                ) && (
                                    <button
                                        className="text-gray-500 hover:text-gray-700 sm:text-sm text-xs"
                                        onClick={() =>
                                            handleDuplicateInvoiceClick(
                                                row.original.id
                                            )
                                        }
                                        title="Duplicate Invoice"
                                    >
                                        <Icon
                                            icon="mdi:content-duplicate"
                                            className="h-5 w-5"
                                        />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                ),
                meta: { responsive: true },
            },
        ];
        return baseColumns.filter(Boolean);
    }, [
        showInvoice,
        showCustomer,
        showQuantity,
        showDate,
        showTotal,
        showDiscount,
        showTax,
        showInvoiceTotal,
        showReceivable,
        showPaid,
        showDue,
        showPurchaseCost,
        showProfit,
        showReceiveAccount,
        showSaleBy,
        showStatus,
        showSaleStatus,
        showAction,
        sales,
        filters,
        showAdditionalCharge,
        showOrderType,
        showCourierStatus,
        permissions,
        selectedRows,
    ]);

    // filter table data
    const filteredData = useMemo(() => {
        setIsLoading(true);
        let filtered = sales;

        // Customer Filter
        if (filters.customer.length > 0) {
            filtered = filtered.filter((row) =>
                filters.customer.includes(row.customer?.name ?? "N/A")
            );
        }

        // Receive Account Filter
        if (filters.receiveAccount.length > 0) {
            filtered = filtered.filter((row) => {
                const accountNames = Array.isArray(row.account_receive)
                    ? row.account_receive.map((acc) => acc?.bank?.name ?? "N/A")
                    : [row.account_receive?.name ?? "N/A"];
                return accountNames.some((name) =>
                    filters.receiveAccount.includes(name)
                );
            });
        }

        // Sale By Filter
        if (filters.saleBy.length > 0) {
            filtered = filtered.filter((row) =>
                filters.saleBy.includes(row.sale_by?.name ?? "N/A")
            );
        }

        // Status Filter
        if (filters.status.length > 0) {
            filtered = filtered.filter((row) =>
                filters.status.includes(row.status)
            );
        }

        // Sale Status Filter
        if (filters.saleStatus.length > 0) {
            filtered = filtered.filter((row) =>
                filters.saleStatus.includes(row.order_status)
            );
        }

        // Courier Status Filter
        if (filters.courierStatus.length > 0) {
            filtered = filtered.filter((row) =>
                filters.courierStatus.includes(row.courier_status)
            );
        }

        // Order Type Filter
        if (filters.orderType.length > 0) {
            filtered = filtered.filter((row) =>
                filters.orderType.includes(row.order_type)
            );
        }

        // Quantity Filter
        if (filters.quantity.min || filters.quantity.max) {
            filtered = filtered.filter((row) => {
                const value = Number(row.quantity) || 0;
                const min = Number(filters.quantity.min) || -Infinity;
                const max = Number(filters.quantity.max) || Infinity;
                const type = filters.quantity.type || "between";

                switch (type) {
                    case "exact":
                        return value === min;
                    case "greater":
                        return value > min;
                    case "less":
                        return value < min;
                    case "between":
                        return value >= min && value <= max;
                    default:
                        return true;
                }
            });
        }

        // Date Filter
        if (filters.sale_date.start) {
            filtered = filtered.filter((row) => {
                try {
                    const saleDate = parseISO(row.sale_date);
                    const start = filters.sale_date.start;
                    const end = filters.sale_date.end;
                    const type = filters.sale_date.type || "between";

                    switch (type) {
                        case "exact":
                            return (
                                saleDate.toDateString() === start.toDateString()
                            );
                        case "before":
                            return saleDate < start;
                        case "after":
                            return saleDate > start;
                        case "between":
                            return (
                                end &&
                                isWithinInterval(saleDate, {
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

        // Price Field Filter (Total, Discount, Additional Charge, Receivable, Paid, Due, Purchase Cost, Profit)
        const priceFields = [
            "total",
            "discount",
            "tax",
            "invoice_total",
            "additional_charge_total",
            "receivable",
            "paid",
            "due",
            "total_purchase_cost",
            "profit",
        ];

        priceFields.forEach((field) => {
            if (filters[field].min || filters[field].max) {
                filtered = filtered.filter((row) => {
                    let value = 0;
                    if (field === "total") {
                        value = Number(row.product_total || 0);
                    } else if (field === "discount") {
                        value = Number(row.actual_discount || 0); // Specific handling for discount
                    } else if (field === "receivable") {
                        value = Number(row.grand_total || 0);
                    } else {
                        value = Number(row[field] || 0);
                    }
                    const min = Number(filters[field].min) || -Infinity;
                    const max = Number(filters[field].max) || Infinity;
                    const type = filters[field].type || "between";

                    switch (type) {
                        case "exact":
                            return value === min;
                        case "greater":
                            return value > min;
                        case "less":
                            return value < min;
                        case "between":
                            return value >= min && value <= max;
                        default:
                            return true;
                    }
                });
            }
        });
        // priceFields.forEach((field) => {
        //     if (filters[field].min || filters[field].max) {
        //         filtered = filtered.filter((row) => {
        //             const value = Number(
        //                 row[field] ||
        //                     row.grand_total ||
        //                     row.actual_discount ||
        //                     0
        //             ); // For receivable use grand_total if needed
        //             const min = Number(filters[field].min) || -Infinity;
        //             const max = Number(filters[field].max) || Infinity;
        //             const type = filters[field].type || "between";

        //             switch (type) {
        //                 case "exact":
        //                     return value === min;
        //                 case "greater":
        //                     return value > min;
        //                 case "less":
        //                     return value < min;
        //                 case "between":
        //                     return value >= min && value <= max;
        //                 default:
        //                     return true;
        //             }
        //         });
        //     }
        // });

        // Global Filter
        if (globalFilter) {
            const lowercasedFilter = globalFilter.toLowerCase();
            filtered = filtered.filter((row) => {
                const receiveNames = Array.isArray(row.account_receive)
                    ? row.account_receive
                          .map((acc) => acc?.bank?.name ?? "N/A")
                          .join(", ")
                    : row.account_receive?.name ?? "N/A";
                return (
                    String(row.id).toLowerCase().includes(lowercasedFilter) ||
                    (showInvoice &&
                        String(row.invoice_number)
                            .toLowerCase()
                            .includes(lowercasedFilter)) ||
                    (showCustomer &&
                        String(row.customer?.name ?? "")
                            .toLowerCase()
                            .includes(lowercasedFilter)) ||
                    (showQuantity &&
                        String(row.quantity)
                            .toLowerCase()
                            .includes(lowercasedFilter)) ||
                    (showDate &&
                        String(row.sale_date)
                            .toLowerCase()
                            .includes(lowercasedFilter)) ||
                    (showTotal &&
                        String(row.product_total)
                            .toLowerCase()
                            .includes(lowercasedFilter)) ||
                    (showDiscount &&
                        String(row.actual_discount)
                            .toLowerCase()
                            .includes(lowercasedFilter)) ||
                    (showTax && // New
                        String(row.tax)
                            .toLowerCase()
                            .includes(lowercasedFilter)) ||
                    (showInvoiceTotal && // New
                        String(row.invoice_total)
                            .toLowerCase()
                            .includes(lowercasedFilter)) ||
                    (showAdditionalCharge &&
                        String(row.additional_charge_total)
                            .toLowerCase()
                            .includes(lowercasedFilter)) ||
                    (showReceivable &&
                        String(row.grand_total)
                            .toLowerCase()
                            .includes(lowercasedFilter)) ||
                    (showPaid &&
                        String(row.paid)
                            .toLowerCase()
                            .includes(lowercasedFilter)) ||
                    (showDue &&
                        String(row.due)
                            .toLowerCase()
                            .includes(lowercasedFilter)) ||
                    (showPurchaseCost &&
                        String(row.total_purchase_cost)
                            .toLowerCase()
                            .includes(lowercasedFilter)) ||
                    (showProfit &&
                        String(row.profit)
                            .toLowerCase()
                            .includes(lowercasedFilter)) ||
                    (showReceiveAccount &&
                        String(receiveNames)
                            .toLowerCase()
                            .includes(lowercasedFilter)) ||
                    (showSaleBy &&
                        String(row.sale_by?.name ?? "")
                            .toLowerCase()
                            .includes(lowercasedFilter)) ||
                    (showStatus &&
                        String(row.status)
                            .toLowerCase()
                            .includes(lowercasedFilter)) ||
                    (showSaleStatus &&
                        String(row.order_status)
                            .toLowerCase()
                            .includes(lowercasedFilter)) ||
                    (showCourierStatus &&
                        String(row.courier_status)
                            .toLowerCase()
                            .includes(lowercasedFilter)) ||
                    (showOrderType &&
                        String(row.order_type)
                            .toLowerCase()
                            .includes(lowercasedFilter))
                );
            });
        }

        setTimeout(() => setIsLoading(false), 100);
        return filtered;
    }, [
        globalFilter,
        sales,
        showInvoice,
        showCustomer,
        showQuantity,
        showDate,
        showTotal,
        showDiscount,
        showTax,
        showInvoiceTotal,
        showReceivable,
        showPaid,
        showDue,
        showPurchaseCost,
        showProfit,
        showReceiveAccount,
        showSaleBy,
        showStatus,
        showSaleStatus,
        filters,
        showAdditionalCharge,
        showOrderType,
        showCourierStatus,
        permissions,
        startDate,
        endDate,
    ]);

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

    const totalSalesCount = filteredData.length;
    const handleClearDateFilter = () => {
        setStartDate(null);
        setEndDate(null);
    };

    // handle edit function
    const handleEditClick = (id) => {
        location.href = "/sale/edit/" + id;
    };

    // handle Invoice Function
    const handleInvoiceClick = (id) => {
        location.href = "/sale/invoice/" + id;
    };

    // handle Return Function
    const handleReturnClick = (id) => {
        location.href = "/return/" + id;
    };

    // handle Duplicate Invoice Function
    const handleDuplicateInvoiceClick = (id) => {
        location.href = "/sale/duplicate/invoice/" + id;
    };

    // handle Payment Function
    const handlePaymentClick = (invoice) => {
        // console.log("invoice", invoice);
        setSelectedInvoice(invoice);
        setIsPaymentModalOpen(true);
    };

    // delete functionality Implement
    const handleDelete = async (id) => {
        try {
            setIsLoading(true);

            await new Promise((resolve) => {
                router.delete(`/sale/delete/${id}`, {
                    onSuccess: () => {
                        toast.success("Invoice Deleted Successfully");
                        setIsModalOpen(false);
                        router.reload({ only: ["sales"] });
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

    const openDeleteModal = (invoice) => {
        setSelectedSaleId(invoice);
        setIsModalOpen(true);
    };

    const handleModuleIsOngoing = () => {
        toast.success("This Module is is Work in Progress");
    };

    return (
        <div className="p-4">
            <div className="mb-4">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
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
                    <div className="flex gap-2 items-center" ref={dropdownRef}>
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
                                            {pos_settings.invoice_payment ===
                                                1 && (
                                                <button
                                                    onClick={() => {
                                                        handleModuleIsOngoing();
                                                        setIsActionDropdownOpen(
                                                            false
                                                        );
                                                    }}
                                                    className={`block w-full text-left px-5 py-3 text-sm font-medium flex items-center gap-3 transition-colors duration-200 ${
                                                        selectedRows.length !==
                                                        1
                                                            ? "text-gray-400 cursor-not-allowed opacity-60"
                                                            : "text-purple-500 hover:bg-purple-50 hover:text-purple-600"
                                                    }`}
                                                    disabled={
                                                        selectedRows.length !==
                                                        1
                                                    }
                                                >
                                                    <Icon
                                                        icon="fluent:payment-16-filled"
                                                        className="h-5 w-5"
                                                    />
                                                    Link Payment
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
                            <Icon icon="mdi:file-pdf-box" className="h-5 w-5" />
                        </button>
                        <button
                            onClick={exportToExcel}
                            className="py-1 px-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200"
                            title="Export to Excel"
                        >
                            <Icon icon="mdi:file-excel" className="h-5 w-5" />
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
                            fields={saleManageTableFields}
                            onFieldChange={handleFieldChange}
                        />
                    </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">
                        Total Sales: {totalSalesCount}
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
                                Just This month data load. you can filter all
                                data using date field.
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto w-full">
                <table className="min-w-max bg-white shadow rounded-lg table-auto">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="bg-gray-100">
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
                                                header.column.columnDef.header,
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

            {/* payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                item={selectedInvoice}
                accounts={accounts}
            />
        </div>
    );
};

export default SalesTable;
