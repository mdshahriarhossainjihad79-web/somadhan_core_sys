import { useEffect } from "react";
import { router, usePage } from "@inertiajs/react";

const PosPrintInvoice = () => {
    const { props } = usePage();
    const {
        sale,
        customer,
        products,
        setting,
        siteTitle,
        address,
        phone,
        email,
        invoice_logo_type,
    } = props;

    useEffect(() => {
        // Automatically trigger print on page load
        window.print();

        // FallBack Timer: print dialog close after 1 second redirect the sale page
        const redirectTimer = setTimeout(() => {
            router.visit("/sale-page", { replace: true });
        }, 100);

        // onafterprint Event: If Browser support it.
        const handleAfterPrint = () => {
            clearTimeout(redirectTimer); // timer Cleanup
            router.visit("/sale-page", { replace: true });
        };

        window.onafterprint = handleAfterPrint;

        // Cleanup
        return () => {
            window.onafterprint = null;
            clearTimeout(redirectTimer);
        };
    }, []);

    // // Calculate totals
    // const productTotal = Number(sale?.total ?? 0).toFixed(2);
    // const subTotal = sale?.total - sale?.actual_discount ?? 0;
    // const subTotalFormatted = Number(subTotal).toFixed(2);
    // const previousDue =
    //     sale?.receivable > subTotal
    //         ? Number(sale?.receivable - subTotal).toFixed(2)
    //         : 0;

    // Format date
    const formattedDate = sale?.created_at
        ? new Date(sale.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
          })
        : "";
    const formattedTime = sale?.created_at
        ? new Date(sale.created_at).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
          })
        : "";

    return (
        <div className="w-[300px] font-mono text-black text-sm mx-auto">
            <div>
                {invoice_logo_type === "Name" ? (
                    <h4 className="text-lg font-bold">{siteTitle}</h4>
                ) : invoice_logo_type === "Logo" ? (
                    setting?.logo ? (
                        <img
                            src={setting?.logo}
                            alt="logo"
                            className="h-[50px] w-[150px]"
                        />
                    ) : (
                        <h4 className="text-lg font-bold">{siteTitle}</h4>
                    )
                ) : invoice_logo_type === "Both" ? (
                    <>
                        {setting?.logo && (
                            <img
                                src={setting?.logo}
                                alt="logo"
                                className="h-[50px] w-[150px]"
                            />
                        )}
                        <h4 className="text-lg font-bold">{siteTitle}</h4>
                    </>
                ) : (
                    <h4 className="text-lg font-bold">EIL POS Software</h4>
                )}
                <p>{address}</p>
                <p>{email}</p>
                <p>{phone}</p>
                <div className="text-right mr-2.5 mb-2.5">
                    <p>
                        <b>{customer?.name ?? ""}</b>
                    </p>
                    <p>{customer?.address ?? ""}</p>
                    <p>{customer?.email ?? ""}</p>
                    <p>{customer?.phone ?? ""}</p>
                </div>
                <div className="flex justify-between text-xs">
                    <p>{formattedDate}</p>
                    <p>Time: {formattedTime}</p>
                </div>
            </div>
            <hr className="border-dashed border-gray-400 my-2" />
            <div className="text-right">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-left">Item Name</th>
                            <th className="text-center">Qty</th>
                            <th className="text-center">Discount</th>
                            <th className="text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products?.length > 0 &&
                            products.map((product, index) => (
                                <tr key={index}>
                                    <td className="text-left">
                                        {product?.product?.name ?? ""}
                                    </td>
                                    <td className="text-center">
                                        {product?.qty ?? 0}
                                    </td>
                                    <td className="text-center">
                                        {product?.discount ?? 0}
                                    </td>
                                    <td className="text-right">
                                        {product?.sub_total ?? 0}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
                <hr className="border-dashed border-gray-400 my-2" />
                <div className="flex justify-between">
                    <p>Product Total:</p>
                    <p>{sale?.product_total ?? 0}</p>
                </div>
                {sale?.actual_discount > 0 && (
                    <>
                        <hr className="border-dashed border-gray-400 my-2" />
                        <div className="flex justify-between">
                            <p>
                                Discount:{" "}
                                {sale?.discount_type === "percentage"
                                    ? `(${parseInt(sale?.discount)}%)`
                                    : null}
                            </p>
                            <p>৳ {sale?.actual_discount ?? 0}</p>
                        </div>
                    </>
                )}
                {sale?.tax && (
                    <>
                        <hr className="border-dashed border-gray-400 my-2" />
                        <div className="flex justify-between">
                            <p>TAX:</p>
                            <p>{parseInt(sale.tax)}%</p>
                            <p>৳ {sale?.invoice_total ?? 0}</p>
                        </div>
                    </>
                )}
                {/* {sale?.receivable > subTotal && (
                    <>
                        <hr className="border-dashed border-gray-400 my-2" />
                        <div className="flex justify-between">
                            <p>Previous Due:</p>
                            <p>৳ {previousDue}</p>
                        </div>
                    </>
                )} */}
                {sale?.additional_charge_total > 0 ? (
                    <>
                        <hr className="border-dashed border-gray-400 my-2" />
                        <div className="flex justify-between">
                            <p>Additional Charge</p>
                            <p>৳ {sale?.additional_charge_total ?? 0}</p>
                        </div>
                    </>
                ) : null}
                <hr className="border-dashed border-gray-400 my-2" />
                <div className="flex justify-between">
                    <p>Grand Total:</p>
                    <p>৳ {Number(sale?.grand_total ?? 0).toFixed(2)}</p>
                </div>
                <hr className="border-dashed border-gray-400 my-2" />
                <div className="flex justify-between">
                    <p>Paid</p>
                    <p>৳ {Number(sale?.paid ?? 0).toFixed(2)}</p>
                </div>
                <hr className="border-dashed border-gray-400 my-2" />
                <div className="flex justify-between">
                    {sale?.due >= 0 ? (
                        <>
                            <p>Balance Due</p>
                            <p>৳ {Number(sale?.due ?? 0).toFixed(2)}</p>
                        </>
                    ) : (
                        <>
                            <p>Return</p>
                            <p>
                                ৳{" "}
                                {Number(
                                    Math.abs(sale?.change_amount) ?? 0
                                ).toFixed(2)}
                            </p>
                        </>
                    )}
                </div>
                <hr className="border-dashed border-gray-400 my-2" />
                <p>Thank you for your purchase!</p>
            </div>

            <style jsx>{`
                @media print {
                    body {
                        font-family: "Space Mono", monospace;
                        font-weight: 500;
                        font-style: normal;
                        font-size: 11px;
                        color: #000000;
                        text-align: left !important;
                        width: 300px !important;
                    }
                    nav,
                    .footer,
                    .btn_group {
                        display: none !important;
                    }
                    .page-content {
                        margin-top: 0 !important;
                        padding-top: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default PosPrintInvoice;
