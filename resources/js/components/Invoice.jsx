import { Head, usePage } from "@inertiajs/react";
import cn from "../utils/cn";
import { useEffect } from "react";

const Invoice = ({ setIsReady }) => {
    const { props } = usePage();
    const { sale, customer, products, setting } = props;

    const {
        invoice_logo_type,
        company,
        logo,
        address,
        phone,
        email,
        color_view,
        size_view,
        warranty,
        sale_hands_on_discount,
        tax,
        discount,
        invoice_payment,
        invoice_type,
    } = setting;

    useEffect(() => {
        if (!logo) {
            setIsReady(true); // No logo, so ready immediately
        }
    }, [logo, setIsReady]);

    return (
        <div className="min-h-screen bg-white text-gray-800 font-sans">
            <Head title={`Sale Invoice-${sale?.invoice_number}`} />
            <div
                className={cn("max-w-2xl mx-auto py-6 relative print-invoice")}
            >
                <div className="flex justify-between mb-4">
                    <div className="w-1/2">
                        {invoice_logo_type === "Name" ? (
                            <a
                                href="#"
                                className="text-lg font-bold block mt-2"
                            >
                                {company ?? "N/A"}
                            </a>
                        ) : invoice_logo_type === "Logo" ? (
                            logo ? (
                                <img
                                    src={`/${logo}`}
                                    alt="logo"
                                    className="h-16 w-32 -ml-2"
                                    onLoad={() => setIsReady(true)}
                                />
                            ) : (
                                <p className="mt-1 mb-1 font-bold text-base">
                                    {company ?? "N/A"}
                                </p>
                            )
                        ) : invoice_logo_type === "Both" ? (
                            <>
                                {logo && (
                                    <img
                                        src={`/${logo}`}
                                        alt="logo"
                                        className="h-16 w-32 -ml-2"
                                        onLoad={() => setIsReady(true)}
                                    />
                                )}
                                <p className="mt-1 mb-1 font-bold text-base">
                                    {company ?? "N/A"}
                                </p>
                            </>
                        ) : (
                            <a
                                href="#"
                                className="text-lg font-bold block mt-2"
                            >
                                EIL<span className="text-blue-600">POS</span>
                            </a>
                        )}
                        <p className="max-w-[200px] text-sm leading-tight mt-2">
                            {address}
                        </p>
                        <p className="text-sm leading-tight">{phone}</p>
                        <p className="text-sm leading-tight">{email}</p>
                        <p className="mt-2 text-sm leading-tight">
                            <span className="font-semibold">
                                Customer Name:
                            </span>{" "}
                            <b>{customer?.name ?? ""}</b>
                        </p>
                        <p className="text-sm leading-tight">
                            <span className="font-semibold">Phone:</span>{" "}
                            {customer?.phone ?? ""}
                        </p>
                    </div>
                    <div className="w-1/2 text-right">
                        <h4 className="font-bold uppercase text-base mt-2 mb-1">
                            Invoice
                        </h4>
                        <h6 className="mb-0 text-sm">
                            # INV-{sale?.invoice_number ?? 0}
                        </h6>
                        <h6 className="text-sm font-medium border-gray-500 inline-block">
                            <strong>Invoice by:</strong>{" "}
                            {sale?.sale_by?.name ?? "N/A"}
                        </h6>

                        {sale?.due > 0 ? (
                            <>
                                <p className="mb-1 mt-4 text-sm">Due</p>
                                <h4 className="font-normal text-red-600 text-base">
                                    ৳ {Number(sale?.due ?? 0).toFixed(2)}
                                </h4>
                            </>
                        ) : (
                            <>
                                <p className="mb-1 mt-4 text-sm">Total Paid</p>
                                <h4 className="font-normal text-green-600 text-base">
                                    ৳ {Number(sale?.paid ?? 0).toFixed(2)}
                                </h4>
                            </>
                        )}
                        <h6 className="mt-2 text-sm">
                            <span className="text-gray-500">Invoice Date:</span>{" "}
                            {sale?.sale_date ?? ""}
                        </h6>
                    </div>
                </div>
                {sale?.due <= 0 && (
                    <img
                        src="/assets/images/stamp.png"
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-48 opacity-20"
                        alt="stamp"
                    />
                )}
                <div className="mt-4">
                    <table className="w-full border-collapse">
                        {/* Removed border from table to apply it individually */}
                        <thead className="bg-blue-400 text-black">
                            <tr>
                                <th className="py-1 px-2 text-left text-sm font-semibold border border-blue-400">
                                    #
                                </th>
                                <th className="py-1 px-2 text-left text-sm font-semibold border border-blue-400">
                                    Product Name
                                </th>
                                {color_view === 1 && (
                                    <th className="py-1 px-2 text-left text-sm font-semibold border border-blue-400">
                                        Color
                                    </th>
                                )}
                                {size_view === 1 && (
                                    <th className="py-1 px-2 text-left text-sm font-semibold border border-blue-400">
                                        Size
                                    </th>
                                )}
                                {warranty === 1 && (
                                    <th className="py-1 px-2 text-right text-sm font-semibold border border-blue-400">
                                        Warranty
                                    </th>
                                )}
                                <th className="py-1 px-2 text-right text-sm font-semibold border border-blue-400">
                                    Unit Cost
                                </th>
                                <th className="py-1 px-2 text-right text-sm font-semibold border border-blue-400">
                                    Quantity
                                </th>
                                {sale_hands_on_discount === 1 && (
                                    <th className="py-1 px-2 text-right text-sm font-semibold border border-blue-400">
                                        Discount
                                    </th>
                                )}
                                <th className="py-1 px-2 text-right text-sm font-semibold border border-blue-400">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {products?.length > 0 ? (
                                <>
                                    {products.map((product, index) => (
                                        <tr
                                            key={index}
                                            className="text-right hover:bg-gray-50"
                                        >
                                            <td className="py-1 px-2 text-left text-sm border border-blue-400">
                                                {index + 1}
                                            </td>
                                            <td className="py-1 px-2 text-left text-sm border border-blue-400">
                                                {product?.product?.name ?? ""}
                                            </td>
                                            {color_view === 1 && (
                                                <td className="py-1 px-2 text-left text-sm border border-blue-400">
                                                    {product?.variant
                                                        ?.color_name?.name ??
                                                        "N/A"}
                                                </td>
                                            )}
                                            {size_view === 1 && (
                                                <td className="py-1 px-2 text-left text-sm border border-blue-400">
                                                    {product?.variant
                                                        ?.variation_size
                                                        ?.size ?? "N/A"}
                                                </td>
                                            )}
                                            {warranty === 1 && (
                                                <td className="py-1 px-2 text-sm border border-blue-400">
                                                    {product?.warranty
                                                        ?.duration ?? "N/A"}
                                                </td>
                                            )}
                                            <td className="py-1 px-2 text-sm border border-blue-400">
                                                {product?.rate ?? 0}
                                            </td>
                                            <td className="py-1 px-2 text-sm border border-blue-400">
                                                {product?.qty ?? 0}
                                            </td>
                                            {sale_hands_on_discount === 1 && (
                                                <td className="py-1 px-2 text-sm border border-blue-400">
                                                    {product?.discount ?? 0}
                                                </td>
                                            )}
                                            <td className="py-1 px-2 text-sm border border-blue-400">
                                                {product?.sub_total ?? 0}
                                            </td>
                                        </tr>
                                    ))}
                                    {Array.from({
                                        length:
                                            invoice_type === "a4"
                                                ? 15 - products.length
                                                : 10 - products.length,
                                    }).map((_, i) => (
                                        <tr
                                            key={i + products.length}
                                            className="text-left"
                                        >
                                            <td className="py-1 px-2 text-sm border border-blue-400">
                                                {i + products.length + 1}
                                            </td>
                                            <td className="py-1 px-2 border border-blue-400"></td>
                                            {color_view === 1 && (
                                                <td className="py-1 px-2 border border-blue-400"></td>
                                            )}
                                            {size_view === 1 && (
                                                <td className="py-1 px-2 border border-blue-400"></td>
                                            )}
                                            {warranty === 1 && (
                                                <td className="py-1 px-2 border border-blue-400"></td>
                                            )}
                                            <td className="py-1 px-2 border border-blue-400"></td>
                                            <td className="py-1 px-2 border border-blue-400"></td>
                                            {sale_hands_on_discount === 1 && (
                                                <td className="py-1 px-2 border border-blue-400"></td>
                                            )}
                                            <td className="py-1 px-2 border border-blue-400"></td>
                                        </tr>
                                    ))}
                                </>
                            ) : (
                                <tr className="text-center">
                                    <td
                                        colSpan="8"
                                        className="py-2 px-2 text-sm border border-blue-400"
                                    >
                                        Data Not Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4">
                    <div className="grid sm:grid-cols-2 gap-5">
                        <div className="">
                            {sale?.additional_charges.length > 0 && (
                                <>
                                    <h4>Additional Charge</h4>
                                    <table className="w-full">
                                        <tbody>
                                            {sale?.additional_charges.map(
                                                (charge, i) => (
                                                    <tr key={i}>
                                                        <td className="py-1 text-sm">
                                                            {charge
                                                                ?.additional_charge_name
                                                                ?.name ?? "N/A"}
                                                        </td>
                                                        <td className="py-1 text-right text-sm">
                                                            ৳{" "}
                                                            {charge?.amount ??
                                                                0}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </>
                            )}
                        </div>
                        <div className="">
                            <table className="w-full">
                                <tbody>
                                    <tr>
                                        <td className="py-1 text-sm">
                                            Product Total
                                        </td>
                                        <td className="py-1 text-right text-sm">
                                            ৳ {sale?.product_total ?? 0}
                                        </td>
                                    </tr>
                                    {sale?.actual_discount > 0 && (
                                        <tr>
                                            <td className="py-1 text-sm">
                                                Discount{" "}
                                                {sale?.discount_type === "fixed"
                                                    ? ""
                                                    : `(${parseInt(
                                                          sale?.discount
                                                      )}%)`}
                                            </td>
                                            <td className="py-1 text-right text-sm">
                                                ৳ {sale?.actual_discount}
                                            </td>
                                        </tr>
                                    )}
                                    {tax === 1 && (
                                        <tr>
                                            <td className="py-1 text-sm">
                                                TAX ({parseInt(sale?.tax)}%)
                                            </td>
                                            <td className="py-1 text-right text-sm">
                                                ৳{" "}
                                                {Number(
                                                    (sale?.product_total *
                                                        sale?.tax) /
                                                        100
                                                ).toFixed(2)}
                                            </td>
                                        </tr>
                                    )}

                                    {sale?.additional_charge_total > 0 ? (
                                        <>
                                            <tr>
                                                <td className="py-1 font-semibold text-sm">
                                                    Invoice Total
                                                </td>
                                                <td className="py-1 font-semibold text-right text-sm">
                                                    ৳ {sale?.invoice_total ?? 0}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="py-1 font-semibold text-sm">
                                                    Additional Charge
                                                </td>
                                                <td className="py-1 font-semibold text-right text-sm">
                                                    ৳{" "}
                                                    {sale?.additional_charge_total ??
                                                        0}
                                                </td>
                                            </tr>
                                        </>
                                    ) : null}

                                    <tr>
                                        <td className="py-1 font-semibold text-sm">
                                            Grand Total
                                        </td>
                                        <td className="py-1 font-semibold text-right text-sm">
                                            ৳{" "}
                                            {Number(
                                                sale?.grand_total ?? 0
                                            ).toFixed(2)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 text-sm">Paid</td>
                                        <td className="py-1 text-green-600 text-right text-sm">
                                            ৳{" "}
                                            {Number(sale?.paid ?? 0).toFixed(2)}
                                        </td>
                                    </tr>
                                    {sale?.due > 0 ? (
                                        <tr>
                                            <td className="py-1 font-semibold text-sm">
                                                Due
                                            </td>
                                            <td className="py-1 font-semibold text-red-600 text-right text-sm">
                                                ৳{" "}
                                                {Number(sale?.due ?? 0).toFixed(
                                                    2
                                                )}
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <td className="py-1 font-semibold text-sm">
                                                Change Amount
                                            </td>
                                            <td className="py-1 font-semibold text-right text-sm">
                                                ৳{" "}
                                                {Number(
                                                    Math.abs(
                                                        sale?.change_amount
                                                    ) ?? 0
                                                ).toFixed(2)}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="mt-4 text-right">
                    {invoice_type === "a4" || invoice_type === "a5" ? (
                        <button
                            onClick={() => window.print()}
                            className="print-button bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                            <i className="fas fa-print mr-1"></i>Print Invoice
                        </button>
                    ) : (
                        <a
                            href={`/sale/print/${sale?.id}`}
                            className="print-button bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                            <i className="fas fa-print mr-1"></i>Print Invoice
                        </a>
                    )}
                </div>
            </div>

            <style jsx>
                {`
                    @media print {
                        ${invoice_type === "a4"
                            ? "@page { size: A4; margin: 10mm; }"
                            : invoice_type === "a5"
                            ? "@page { size: A5; margin: 4mm; }"
                            : "@page { size: auto; margin: 10mm; }"}

                        aside, nav, footer, .print-button {
                            display: none !important;
                        }

                        body {
                            margin: 0 !important;
                            padding: 0 !important;
                        }

                        .print-invoice {
                            width: 100% !important;
                            max-width: 100% !important;
                            margin: 0 auto !important;
                            padding: 0 !important;
                        }

                        /* --- Page break rules --- /
                        table {
                          page-break-inside: auto;
                          border-collapse: collapse;
                        }
                        thead {
                          display: table-header-group; / repeat header in every page /
                        }
                        tfoot {
                          display: table-footer-group;
                        }
                        tr {
                          page-break-inside: avoid; 
                          page-break-after: auto;
                        }
                    
                        / force remove wrong breaks */

                         {
                            page-break-before: auto !important;
                            page-break-after: auto !important;
                        }

                        .hover\:bg-gray-50:hover {
                            background: transparent !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default Invoice;
