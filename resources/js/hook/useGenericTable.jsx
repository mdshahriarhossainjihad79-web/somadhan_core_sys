import { useState, useMemo, useEffect } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from "@tanstack/react-table";
import { parseISO, isWithinInterval } from "date-fns";
import FilterDropdown from "../components/FilterDropdown";
// import { formatHeaderText } from "../utils/formatHeaderText"; // আপনার path
// import FilterDropdown from "../components/FilterDropdown"; // আপনার path

export const useGenericTable = (data, config, permissions = []) => {
    const [globalFilter, setGlobalFilter] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [sorting, setSorting] = useState([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [filters, setFilters] = useState(config.initialFilters || {});
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSaleId, setSelectedSaleId] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
    const [isTooltipOpen, setIsTooltipOpen] = useState(false);

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

    const handleClearDateFilter = () => {
        setStartDate(null);
        setEndDate(null);
    };

    // Columns dynamic generation
    const columns = useMemo(() => {
        const options = {};
        config.fields.forEach((field) => {
            options[field.key] = [
                ...new Set(
                    data.map((row) =>
                        field.optionsExtractor
                            ? field.optionsExtractor(row)
                            : row[field.key] ?? "N/A"
                    )
                ),
            ];
        });

        return [
            {
                id: "select",
                header: () => (
                    <input
                        type="checkbox"
                        checked={
                            data.length > 0 &&
                            selectedRows.length === data.length
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
                id: config.slKey || "sl",
                header: config.slLabel || "SL No",
                cell: ({ row }) => row.index + 1,
                meta: { responsive: true },
            },
            ...config.fields
                .filter((field) => field.show && field.show(data, permissions)) // dynamic show
                .map((field) => ({
                    accessorKey: field.key,
                    header: () => (
                        <div className="flex items-center gap-2">
                            {field.label}
                            <FilterDropdown
                                field={field.key}
                                options={options[field.key] || []}
                                selectedValues={
                                    filters[field.key] ||
                                    (field.filterType === "numeric" ||
                                    field.filterType === "date"
                                        ? {}
                                        : [])
                                }
                                onChange={handleFilterChange}
                                filterType={field.filterType || "checkbox"}
                            />
                        </div>
                    ),
                    accessorFn:
                        field.accessorFn || ((row) => row[field.key] ?? "N/A"),
                    cell:
                        field.cellRenderer ||
                        (({ row }) =>
                            field.cellFormatter
                                ? field.cellFormatter(row.original[field.key])
                                : row.original[field.key]),
                    enableSorting: field.enableSorting || false,
                    meta: { responsive: field.responsive !== false },
                    footer: field.footer
                        ? ({ table }) => field.footer(table)
                        : undefined,
                })),
            config.actionConfig && {
                accessorKey: "action",
                header: "Action",
                cell: ({ row }) => (
                    <div className="flex flex-col sm:flex-row gap-2">
                        {config.actionConfig.buttons
                            .filter(
                                (btn) =>
                                    !btn.condition ||
                                    btn.condition(row.original, permissions)
                            )
                            .map((btn, idx) => (
                                <button
                                    key={idx}
                                    className={btn.className}
                                    onClick={() => btn.onClick(row.original)}
                                    title={btn.title}
                                    disabled={btn.disabled?.(row.original)}
                                >
                                    <Icon icon={btn.icon} className="h-5 w-5" />
                                </button>
                            ))}
                    </div>
                ),
                meta: { responsive: true },
            },
        ].filter(Boolean);
    }, [data, config, filters, permissions, selectedRows]);

    // Filtered data dynamic
    const filteredData = useMemo(() => {
        setIsLoading(true);
        let filtered = data;

        // Checkbox filters
        config.fields
            .filter(
                (field) =>
                    field.filterType === "checkbox" &&
                    filters[field.key]?.length > 0
            )
            .forEach((field) => {
                filtered = filtered.filter((row) =>
                    filters[field.key].includes(
                        field.accessorFn
                            ? field.accessorFn(row)
                            : row[field.key] ?? "N/A"
                    )
                );
            });

        // Numeric/Date filters
        config.fields
            .filter(
                (field) =>
                    (field.filterType === "numeric" ||
                        field.filterType === "date") &&
                    (filters[field.key]?.min ||
                        filters[field.key]?.max ||
                        filters[field.key]?.start)
            )
            .forEach((field) => {
                filtered = filtered.filter((row) => {
                    const value = field.filterExtractor
                        ? field.filterExtractor(row)
                        : row[field.key] ?? 0;
                    const numValue = Number(value);
                    const min = Number(filters[field.key].min) || -Infinity;
                    const max = Number(filters[field.key].max) || Infinity;
                    const start = filters[field.key].start;
                    const end = filters[field.key].end;
                    const type = filters[field.key].type || "between";

                    if (field.filterType === "date") {
                        try {
                            const dateValue = parseISO(value);
                            switch (type) {
                                case "exact":
                                    return (
                                        dateValue.toDateString() ===
                                        start.toDateString()
                                    );
                                case "before":
                                    return dateValue < start;
                                case "after":
                                    return dateValue > start;
                                case "between":
                                    return (
                                        end &&
                                        isWithinInterval(dateValue, {
                                            start,
                                            end,
                                        })
                                    );
                                default:
                                    return true;
                            }
                        } catch {
                            return false;
                        }
                    } else {
                        switch (type) {
                            case "exact":
                                return numValue === min;
                            case "greater":
                                return numValue > min;
                            case "less":
                                return numValue < min;
                            case "between":
                                return numValue >= min && numValue <= max;
                            default:
                                return true;
                        }
                    }
                });
            });

        // Global filter
        if (globalFilter) {
            const lowercasedFilter = globalFilter.toLowerCase();
            filtered = filtered.filter((row) => {
                return (
                    config.fields.some((field) => {
                        const fieldValue = field.accessorFn
                            ? field.accessorFn(row)
                            : row[field.key] ?? "";
                        return String(fieldValue)
                            .toLowerCase()
                            .includes(lowercasedFilter);
                    }) ||
                    String(row.id).toLowerCase().includes(lowercasedFilter)
                );
            });
        }

        setTimeout(() => setIsLoading(false), 100);
        return filtered;
    }, [data, globalFilter, filters, config.fields]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { sorting, pagination, globalFilter },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const totalCount = filteredData.length;

    return {
        table,
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
        dropdownRef: { current: null }, // useRef external-এ handle
        handleClearDateFilter,
        handleSelectAll,
        handleRowSelect,
        handleFilterChange,
        isModalOpen,
        setIsModalOpen,
        selectedSaleId,
        setSelectedSaleId,
        isLoading,
        totalCount,
    };
};
