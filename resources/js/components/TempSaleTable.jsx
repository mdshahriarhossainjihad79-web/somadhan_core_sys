import React, { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
// import { useGenericTable } from "../hooks/useGenericTable";
// import { useTableExport } from "../hooks/useTableExport";
import GenericTable from "../components/GenericTable";
// import { salesConfig } from "../configs/salesConfig";
import useTableFieldHideShow from "../hook/useTableFieldHideShow";
import PaymentModal from "./PaymentModal";
// import { salesMapping } from "./salesMapping";
import { useGenericTable } from "../hook/useGenericTable";
import { useTableExport } from "../hook/useTableExport";
import { salesConfig } from "../hook/salesConfig";

const TempSaleTable = () => {
    const { props } = usePage();
    const { sales, auth, pos_settings, success, error, accounts } = props;
    const permissions = auth.permissions || [];

    const { saleManageTableFields, handleFieldChange /* show vars */ } =
        useTableFieldHideShow();
    salesConfig.onFieldChange = handleFieldChange; // inject

    const tableInstance = useGenericTable(sales, salesConfig, permissions);
    const exportHandlers = useTableExport(tableInstance.table, salesConfig);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        if (success)
            toast.success(success, { duration: 4000, position: "top-center" });
        if (error)
            toast.error(error, { duration: 4000, position: "top-center" });
    }, [success, error]);

    const handlePaymentClick = (invoice) => {
        setSelectedInvoice(invoice);
        tableInstance.setIsPaymentModalOpen(true); // wait, adjust state
        setIsPaymentModalOpen(true);
    };

    const handleDelete = async (id) => {
        tableInstance.setIsLoading(true);
        await new Promise((resolve) => {
            router.delete(`/sale/delete/${id}`, {
                onSuccess: () => {
                    toast.success("Invoice Deleted Successfully");
                    tableInstance.setIsModalOpen(false);
                    router.reload({ only: ["sales"] });
                    resolve();
                },
                onError: () => {
                    tableInstance.setIsModalOpen(false);
                    resolve();
                },
            });
        });
        tableInstance.setIsLoading(false);
    };

    const openDeleteModal = (invoice) => {
        tableInstance.setSelectedSaleId(invoice.id || invoice);
        tableInstance.setIsModalOpen(true);
    };

    const handleEditClick = (id) => (location.href = `/sale/edit/${id}`);
    // Add other handlers (invoice, return, duplicate)

    // Inject actions to config if needed
    salesConfig.actionConfig.buttons.push(
        {
            icon: "mdi:pencil",
            className: "text-green-500 hover:text-green-700 sm:text-sm text-xs",
            onClick: handleEditClick,
            condition: (row, perms) => perms.includes("pos-manage.edit"),
        },
        // ... other buttons with conditions
        {
            icon: "fluent:payment-16-filled",
            className:
                "text-purple-500 hover:text-purple-700 sm:text-sm text-xs",
            onClick: handlePaymentClick,
            condition: (row) =>
                pos_settings.invoice_payment === 1 && row.due > 0,
        }
    );

    return (
        <>
            <GenericTable
                data={sales}
                config={salesConfig}
                permissions={permissions}
                onDelete={handleDelete}
                onClearDates={tableInstance.handleClearDateFilter}
                onActionOngoing={() =>
                    toast.success("This Module is Work in Progress")
                }
                accounts={accounts}
                tableInstance={tableInstance}
                exportHandlers={exportHandlers}
                totalCount={tableInstance.totalCount}
                isLoading={tableInstance.isLoading}
                paymentModalProps={{
                    isOpen: isPaymentModalOpen,
                    setIsOpen: setIsPaymentModalOpen,
                    item: selectedInvoice,
                }}
            />
            {/* Custom handlers inject via config or props */}
        </>
    );
};

export default TempSaleTable;
