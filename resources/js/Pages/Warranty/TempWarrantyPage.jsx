import { Head, router, usePage } from "@inertiajs/react";
// import MainLayouts from "../../layouts/MainLayouts";
import { useEffect } from "react";
import toast from "react-hot-toast";
import GenericTable from "../../components/GenericTable";
// import { useGenericTable } from "../../hooks/useGenericTable";
// import { useTableExport } from "../../hooks/useTableExport";
// import { warrantyConfig } from "../../configs/warrantyConfig";
import useTableFieldHideShow from "../../hook/useTableFieldHideShow";
import MainLayouts from "../../layouts/MainLayouts";
import { useGenericTable } from "../../hook/useGenericTable";
import { useTableExport } from "../../hook/useTableExport";
import { warrantyConfig } from "../../hook/warrantyConfig";

const TempWarrantyPage = () => {
    const { props } = usePage();
    const { warranties, auth, success, error } = props;
    const permissions = auth.permissions || [];

    const { warrantyManageTableFields, handleFieldChange } =
        useTableFieldHideShow();
    warrantyConfig.onFieldChange = handleFieldChange;

    const tableInstance = useGenericTable(
        warranties,
        warrantyConfig,
        permissions
    );
    const exportHandlers = useTableExport(tableInstance.table, warrantyConfig);

    useEffect(() => {
        if (success)
            toast.success(success, { duration: 4000, position: "top-center" });
        if (error)
            toast.error(error, { duration: 4000, position: "top-center" });
    }, [success, error]);

    const handleDelete = async (id) => {
        tableInstance.setIsLoading(true);
        await new Promise((resolve) => {
            router.delete(`/warranty/delete/${id}`, {
                onSuccess: () => {
                    toast.success("Warranty Deleted Successfully");
                    tableInstance.setIsModalOpen(false);
                    router.reload({ only: ["warranties"] });
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

    const openDeleteModal = (warranty) => {
        tableInstance.setSelectedSaleId(warranty.id || warranty);
        tableInstance.setIsModalOpen(true);
    };

    const handleWarrantyCard = (id) => (location.href = `/warranty/card/${id}`);

    // Inject to config
    warrantyConfig.actionConfig.buttons[0].onClick = handleWarrantyCard;
    warrantyConfig.actionConfig.buttons[1].onClick = openDeleteModal;

    return (
        <MainLayouts>
            <Head title="Warranty Manage Page" />
            <h2 className="mb-4 text-xl font-bold">Warranty Manage Page</h2>
            <GenericTable
                data={warranties}
                config={warrantyConfig}
                permissions={permissions}
                onDelete={handleDelete}
                onClearDates={tableInstance.handleClearDateFilter}
                onActionOngoing={() =>
                    toast.success("This Module is Work in Progress")
                }
                tableInstance={tableInstance}
                exportHandlers={exportHandlers}
                totalCount={tableInstance.totalCount}
                isLoading={tableInstance.isLoading}
                tooltipText="Just This month data load. you can filter all data using date field."
            />
        </MainLayouts>
    );
};

export default TempWarrantyPage;
