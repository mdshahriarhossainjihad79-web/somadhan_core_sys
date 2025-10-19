import { Head } from "@inertiajs/react";
import SalesTable from "../../components/SalesTable";
import MainLayouts from "../../layouts/MainLayouts";
import TempSaleTable from "../../components/TempSaleTable";

const SaleManagePage = () => {
    return (
        <MainLayouts>
            <Head title="Sale Manage Page" />
            <h2 className="mb-4 text-xl font-bold">Sale Manage Page</h2>
            <SalesTable />
            {/* <TempSaleTable /> */}
        </MainLayouts>
    );
};

export default SaleManagePage;
