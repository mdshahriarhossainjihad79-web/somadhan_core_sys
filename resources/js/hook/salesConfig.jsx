export const salesConfig = {
    title: "Sales",
    initialFilters: {
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
    },
    fields: [
        {
            key: "invoice_number",
            label: "Invoice Number",
            accessorFn: (row) => row.invoice_number || "N/A",
            filterType: "checkbox",
            responsive: true,
            show: (data, perms) => perms.includes("pos-manage.invoice"),
            cellRenderer: ({ row }) => (
                <button
                    onClick={() =>
                        (location.href = `/sale/invoice/${row.original.id}`)
                    }
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-xs transition-colors duration-200 sm:text-sm"
                    title="Show Invoice"
                >
                    #{row.original.invoice_number}
                </button>
            ),
            enableSorting: true,
        },
        {
            key: "customer",
            label: "Customer",
            accessorFn: (row) => row.customer?.name ?? "N/A",
            filterType: "checkbox",
            responsive: true,
            enableSorting: false,
        },
        {
            key: "quantity",
            label: "Quantity",
            accessorFn: (row) => String(row.quantity || 0),
            filterType: "numeric",
            responsive: true,
            enableSorting: false,
        },
        {
            key: "sale_date",
            label: "Date",
            accessorFn: (row) => row.sale_date || "N/A",
            filterType: "date",
            responsive: true,
            enableSorting: false,
        },
        {
            key: "total",
            label: "Total",
            accessorFn: (row) => Number(row.product_total || 0),
            cellFormatter: (val) => `৳${Number(val).toFixed(2)}`,
            filterType: "numeric",
            responsive: true,
            footer: ({ table }) =>
                `৳${table
                    .getFilteredRowModel()
                    .rows.reduce(
                        (sum, row) => sum + Number(row.original.product_total),
                        0
                    )
                    .toFixed(2)}`,
            enableSorting: false,
        },
        {
            key: "discount",
            label: "Discount",
            accessorFn: (row) => Number(row.actual_discount || 0),
            cellFormatter: (val) => `৳${Number(val).toFixed(2)}`,
            filterType: "numeric",
            responsive: false,
            footer: ({ table }) =>
                `৳${table
                    .getFilteredRowModel()
                    .rows.reduce(
                        (sum, row) =>
                            sum + Number(row.original.actual_discount),
                        0
                    )
                    .toFixed(2)}`,
            enableSorting: false,
        },
        {
            key: "tax",
            label: "Tax",
            accessorFn: (row) => Number(row.tax || 0),
            cellFormatter: (val) => `৳${Number(val).toFixed(2)}`,
            filterType: "numeric",
            responsive: false,
            footer: ({ table }) =>
                `৳${table
                    .getFilteredRowModel()
                    .rows.reduce(
                        (sum, row) => sum + Number(row.original.tax || 0),
                        0
                    )
                    .toFixed(2)}`,
            enableSorting: false,
        },
        {
            key: "invoice_total",
            label: "Invoice Total",
            accessorFn: (row) => Number(row.invoice_total || 0),
            cellFormatter: (val) => `৳${Number(val).toFixed(2)}`,
            filterType: "numeric",
            responsive: false,
            footer: ({ table }) =>
                `৳${table
                    .getFilteredRowModel()
                    .rows.reduce(
                        (sum, row) =>
                            sum + Number(row.original.invoice_total || 0),
                        0
                    )
                    .toFixed(2)}`,
            enableSorting: false,
        },
        {
            key: "additional_charge_total",
            label: "Additional Charge",
            accessorFn: (row) => Number(row.additional_charge_total || 0),
            cellFormatter: (val) => `৳${Number(val).toFixed(2)}`,
            filterType: "numeric",
            responsive: false,
            footer: ({ table }) =>
                `৳${table
                    .getFilteredRowModel()
                    .rows.reduce(
                        (sum, row) =>
                            sum + Number(row.original.additional_charge_total),
                        0
                    )
                    .toFixed(2)}`,
            enableSorting: false,
        },
        {
            key: "grand_total",
            label: "Receivable",
            accessorFn: (row) => Number(row.grand_total || 0),
            cellFormatter: (val) => `৳${Number(val).toFixed(2)}`,
            filterType: "numeric",
            responsive: false,
            footer: ({ table }) =>
                `৳${table
                    .getFilteredRowModel()
                    .rows.reduce(
                        (sum, row) => sum + Number(row.original.grand_total),
                        0
                    )
                    .toFixed(2)}`,
            enableSorting: false,
        },
        {
            key: "paid",
            label: "Paid",
            accessorFn: (row) => Number(row.paid || 0),
            cellFormatter: (val) => `৳${Number(val).toFixed(2)}`,
            filterType: "numeric",
            responsive: false,
            footer: ({ table }) =>
                `৳${table
                    .getFilteredRowModel()
                    .rows.reduce(
                        (sum, row) => sum + Number(row.original.paid),
                        0
                    )
                    .toFixed(2)}`,
            enableSorting: false,
        },
        {
            key: "due",
            label: "Due",
            accessorFn: (row) => Number(row.due || 0),
            cellFormatter: (val) => `৳${Number(val).toFixed(2)}`,
            filterType: "numeric",
            responsive: false,
            footer: ({ table }) =>
                `৳${table
                    .getFilteredRowModel()
                    .rows.reduce(
                        (sum, row) => sum + Number(row.original.due),
                        0
                    )
                    .toFixed(2)}`,
            enableSorting: false,
        },
        {
            key: "total_purchase_cost",
            label: "Purchase Cost",
            accessorFn: (row) => Number(row.total_purchase_cost || 0),
            cellFormatter: (val) => `৳${Number(val).toFixed(2)}`,
            filterType: "numeric",
            responsive: false,
            footer: ({ table }) =>
                `৳${table
                    .getFilteredRowModel()
                    .rows.reduce(
                        (sum, row) =>
                            sum + Number(row.original.total_purchase_cost),
                        0
                    )
                    .toFixed(2)}`,
            enableSorting: false,
        },
        {
            key: "profit",
            label: "Profit/Loss",
            accessorFn: (row) => Number(row.profit || 0),
            cellFormatter: (val) => (
                <span className={val < 0 ? "text-red-600" : "text-gray-700"}>
                    ৳{Number(val).toFixed(2)}
                </span>
            ),
            filterType: "numeric",
            responsive: false,
            footer: ({ table }) =>
                `৳${table
                    .getFilteredRowModel()
                    .rows.reduce(
                        (sum, row) => sum + Number(row.original.profit),
                        0
                    )
                    .toFixed(2)}`,
            enableSorting: false,
        },
        {
            key: "receive_account",
            label: "Receive Account",
            accessorFn: (row) =>
                Array.isArray(row.account_receive) &&
                row.account_receive.length > 0
                    ? row.account_receive
                          .map((account) => account?.bank?.name ?? "N/A")
                          .join(", ")
                    : row.account_receive?.name ?? "N/A",
            filterType: "checkbox",
            responsive: false,
            enableSorting: false,
        },
        {
            key: "sale_by",
            label: "Sale By",
            accessorFn: (row) => row.sale_by?.name ?? "N/A",
            filterType: "checkbox",
            responsive: false,
            enableSorting: false,
        },
        {
            key: "status",
            label: "Status",
            accessorFn: (row) => String(row.status || "N/A"),
            filterType: "checkbox",
            responsive: true,
            enableSorting: false,
        },
        {
            key: "order_status",
            label: "Sale Status",
            accessorFn: (row) => String(row.order_status || "N/A"),
            filterType: "checkbox",
            responsive: true,
            enableSorting: false,
        },
        {
            key: "courier_status",
            label: "Courier Status",
            accessorFn: (row) => String(row.courier_status || "N/A"),
            filterType: "checkbox",
            responsive: true,
            enableSorting: false,
        },
        {
            key: "order_type",
            label: "Order Type",
            accessorFn: (row) => String(row.order_type || "N/A"),
            filterType: "checkbox",
            responsive: true,
            enableSorting: false,
        },
    ],
    filtersConfig: [
        "customer",
        "status",
        "saleStatus",
        "courierStatus",
        "orderType",
        "receiveAccount",
        "saleBy",
    ],
    actionConfig: {
        buttons: [
            {
                icon: "fa7-solid:file-invoice",
                className:
                    "text-blue-500 hover:text-blue-700 sm:text-sm text-xs",
                onClick: (row) => (location.href = `/sale/invoice/${row.id}`),
                title: "Invoice",
                condition: (row, perms) => perms.includes("pos-manage.invoice"),
            },
            {
                icon: "mdi:undo",
                className:
                    "text-yellow-500 hover:text-yellow-700 sm:text-sm text-xs",
                onClick: (row) => (location.href = `/sale/return/${row.id}`),
                title: "Return",
                condition: (row, perms) =>
                    perms.includes("pos.manage.return") &&
                    row.order_status !== "return",
            },
            {
                icon: "mdi:pencil",
                className:
                    "text-green-500 hover:text-green-700 sm:text-sm text-xs",
                onClick: (row) => (location.href = `/sale/edit/${row.id}`),
                title: "Edit",
                condition: (row, perms) => perms.includes("pos-manage.edit"),
            },
            {
                icon: "fluent:payment-16-filled",
                className:
                    "text-purple-500 hover:text-purple-700 sm:text-sm text-xs",
                onClick: (row) => {}, // handlePaymentClick injected in SalesTable.jsx
                title: "Payment",
                condition: (row, perms) =>
                    perms.pos_settings?.invoice_payment === 1 && row.due > 0,
            },
            {
                icon: "mdi:content-duplicate",
                className:
                    "text-gray-500 hover:text-gray-700 sm:text-sm text-xs",
                onClick: (row) => (location.href = `/sale/duplicate/${row.id}`),
                title: "Duplicate Invoice",
                condition: (row, perms) =>
                    perms.includes("pos-manage.duplicate.invoice"),
            },
            {
                icon: "mdi:delete",
                className: "text-red-500 hover:text-red-700 sm:text-sm text-xs",
                onClick: (row) => {}, // openDeleteModal injected in SalesTable.jsx
                title: "Delete",
                condition: (row, perms) => perms.includes("pos-manage.delete"),
            },
        ],
    },
    mapping: {
        sl: (row, idx) => String(idx + 1),
        invoice_number: (row) => row.invoice_number || "N/A",
        customer: (row) => row.customer?.name ?? "N/A",
        quantity: (row) => String(row.quantity || 0),
        sale_date: (row) => row.sale_date || "N/A",
        total: (row) => `৳${Number(row.product_total || 0).toFixed(2)}`,
        discount: (row) => `৳${Number(row.actual_discount || 0).toFixed(2)}`,
        tax: (row) => `৳${Number(row.tax || 0).toFixed(2)}`,
        invoice_total: (row) => `৳${Number(row.invoice_total || 0).toFixed(2)}`,
        additional_charge_total: (row) =>
            `৳${Number(row.additional_charge_total || 0).toFixed(2)}`,
        grand_total: (row) => `৳${Number(row.grand_total || 0).toFixed(2)}`,
        paid: (row) => `৳${Number(row.paid || 0).toFixed(2)}`,
        due: (row) => `৳${Number(row.due || 0).toFixed(2)}`,
        total_purchase_cost: (row) =>
            `৳${Number(row.total_purchase_cost || 0).toFixed(2)}`,
        profit: (row) => `৳${Number(row.profit || 0).toFixed(2)}`,
        receive_account: (row) =>
            Array.isArray(row.account_receive) && row.account_receive.length > 0
                ? row.account_receive
                      .map((account) => account?.bank?.name ?? "N/A")
                      .join(", ")
                : row.account_receive?.name ?? "N/A",
        sale_by: (row) => row.sale_by?.name ?? "N/A",
        status: (row) => String(row.status || "N/A"),
        order_status: (row) => String(row.order_status || "N/A"),
        courier_status: (row) => String(row.courier_status || "N/A"),
        order_type: (row) => String(row.order_type || "N/A"),
    },
    onFieldChange: null, // Will be injected from useTableFieldHideShow in SalesTable.jsx
};
