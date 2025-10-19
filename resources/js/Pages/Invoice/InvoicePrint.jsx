import { useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import Invoice from "../../components/Invoice";

const InvoicePrint = () => {
    const { props } = usePage();
    const { returnUrl } = props;
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (isReady) {
            // Trigger print when ready
            window.print();

            // Fallback timer: redirect after 1 second if print dialog closes
            const redirectTimer = setTimeout(() => {
                const redirectTo = returnUrl || "/sale-page";
                console.log("Redirecting to:", redirectTo);
                router.visit(redirectTo, { replace: true });
            }, 1000);

            // onafterprint Event
            const handleAfterPrint = () => {
                clearTimeout(redirectTimer);
                const redirectTo = returnUrl || "/sale-page";
                console.log("After print, redirecting to:", redirectTo);
                router.visit(redirectTo, { replace: true });
            };

            window.onafterprint = handleAfterPrint;

            // Cleanup
            return () => {
                window.onafterprint = null;
                clearTimeout(redirectTimer);
            };
        }
    }, [isReady, returnUrl]);

    return <Invoice setIsReady={setIsReady} />;
};

export default InvoicePrint;
