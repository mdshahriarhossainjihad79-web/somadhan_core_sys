import React from "react";
import { flexRender } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import DatePicker from "react-datepicker";
import ThreeDotMenu from "./ThreeDotMenu";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import toast from "react-hot-toast";

const GenericTable = ({
    data,
    config,
    permissions = [],
    onDelete,
    onClearDates,
    onActionOngoing = () => toast.success("This Module is Work in Progress"),
    accounts, // Sales-এর জন্য optional
    selectedRowsHandlers = {}, // { onSelectAll, onRowSelect }
    tableInstance, // useGenericTable থেকে
    exportHandlers, // useTableExport থেকে
    totalCount,
    isLoading,
    tooltipText = "Just This month data load. you can filter all data using date field.",
    paymentModalProps, // Sales-এর জন্য optional
}) => {
    const { handlePrint, exportToPDF, exportToExcel } = exportHandlers || {};
    const {
        globalFilter,
        setGlobalFilter,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        filters,
        setFilters,
        pagination,
        selectedRows,
        setSelectedRows,
        isActionDropdownOpen,
        setIsActionDropdownOpen,
        isTooltipOpen,
        setIsTooltipOpen,
        dropdownRef,
        handleClearDateFilter,
        handleSelectAll,
        handleRowSelect,
        handleFilterChange,
    } = tableInstance;

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
                                            {config.actionsConfig?.delete &&
                                                permissions.includes(
                                                    "pos-manage.delete"
                                                ) && (
                                                    <button
                                                        onClick={() => {
                                                            onActionOngoing();
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
                                            {config.actionsConfig?.payment && (
                                                <button
                                                    onClick={() => {
                                                        onActionOngoing();
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
                        {handlePrint && (
                            <button
                                onClick={handlePrint}
                                className="py-1 px-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
                                title="Print Table"
                            >
                                <Icon icon="mdi:printer" className="h-5 w-5" />
                            </button>
                        )}
                        {exportToPDF && (
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
                        )}
                        {exportToExcel && (
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
                        )}
                        <select
                            value={pagination.pageSize}
                            onChange={(e) =>
                                tableInstance.setPageSize(
                                    Number(e.target.value)
                                )
                            }
                            className="border rounded-md p-1 w-full sm:w-20 text-sm"
                        >
                            {[10, 20, 50, 100].map((pageSize) => (
                                <option key={pageSize} value={pageSize}>
                                    Show {pageSize}
                                </option>
                            ))}
                        </select>
                        <ThreeDotMenu
                            fields={config.fields}
                            onFieldChange={config.onFieldChange}
                        />
                    </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">
                        Total {config.title}: {totalCount}
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
                                {tooltipText}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto w-full">
                <table className="min-w-max bg-white shadow rounded-lg table-auto">
                    <thead>
                        {tableInstance.getHeaderGroups().map((headerGroup) => (
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
                        {tableInstance.getRowModel().rows.map((row) => (
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
                            {tableInstance
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
                        onClick={() => tableInstance.previousPage()}
                        disabled={!tableInstance.getCanPreviousPage()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 text-sm"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => tableInstance.nextPage()}
                        disabled={!tableInstance.getCanNextPage()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 text-sm"
                    >
                        Next
                    </button>
                </div>
                <span className="text-sm">
                    Page {tableInstance.getState().pagination.pageIndex + 1} of{" "}
                    {tableInstance.getPageCount()}
                </span>
            </div>

            <DeleteConfirmationModal
                isOpen={tableInstance.isModalOpen}
                onClose={() => tableInstance.setIsModalOpen(false)}
                onConfirm={onDelete}
                itemId={tableInstance.selectedSaleId}
            />
            {paymentModalProps && (
                <PaymentModal
                    isOpen={paymentModalProps.isOpen}
                    onClose={() => paymentModalProps.setIsOpen(false)}
                    item={paymentModalProps.item}
                    accounts={accounts}
                />
            )}
        </div>
    );
};

export default GenericTable;
