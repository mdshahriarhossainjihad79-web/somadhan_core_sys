import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

const useSaleValidation = (
    rows,
    selectedCustomer,
    invoice,
    paymentMethod,
    payAmount
) => {
    const [errors, setErrors] = useState({});

    const validateSale = async (requirePaymentMethod = true) => {
        const newErrors = {};

        // Validate rows for product, price, and quantity
        rows.forEach((row) => {
            if (row.product) {
                if (!row.price || parseFloat(row.price) <= 0) {
                    newErrors[row.id] = {
                        ...newErrors[row.id],
                        price: "Price must be greater than 0.",
                    };
                }
                if (!row.qty || parseInt(row.qty) <= 0) {
                    newErrors[row.id] = {
                        ...newErrors[row.id],
                        qty: "Quantity must be greater than 0.",
                    };
                }
            }
        });

        // Validate customer
        if (!selectedCustomer) {
            newErrors.selectedCustomer = "Please select a customer.";
        }

        const payAmountValue = parseFloat(payAmount || 0);
        if (requirePaymentMethod && payAmountValue > 0 && !paymentMethod) {
            newErrors.paymentMethod = "Please select a payment method.";
        }

        // Validate products
        if (rows.length === 0 || rows.every((row) => !row.product)) {
            newErrors.products = "Please add at least one product.";
        }

        // Validate invoice number
        if (!invoice || !/^\d{6}$/.test(invoice)) {
            newErrors.invoice = "Invoice number must be exactly 6 digits.";
        } else {
            try {
                const response = await axios.post("/generate-sale-invoice", {
                    invoice_number: invoice,
                });
                if (response.data.status === "exists") {
                    newErrors.invoice = "Invoice number already exists.";
                }
            } catch (error) {
                newErrors.invoice = "Failed to verify invoice number.";
            }
        }

        // Set errors and show toast notifications
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            if (newErrors.products) {
                toast.error(newErrors.products);
            }
            if (newErrors.invoice) {
                toast.error(newErrors.invoice);
            }
            if (newErrors.selectedCustomer) {
                toast.error(newErrors.selectedCustomer);
            }
            if (newErrors.paymentMethod) {
                toast.error(newErrors.paymentMethod);
            }
            return false; // Validation failed
        }

        setErrors({});
        return true; // Validation passed
    };

    return { errors, setErrors, validateSale };
};

export default useSaleValidation;
