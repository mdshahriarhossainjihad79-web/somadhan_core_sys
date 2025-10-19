import MainLayouts from "../../layouts/MainLayouts";
import Invoice from "../../components/Invoice";
import { useState } from "react";

const SaleInvoice = () => {
    const [isReady, setIsReady] = useState(false);
    return (
        <MainLayouts>
            <Invoice setIsReady={setIsReady} />
        </MainLayouts>
    );
};

export default SaleInvoice;
