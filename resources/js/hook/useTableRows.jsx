import { useState, useRef } from "react";

const useTableRows = (initialRows) => {
    const [rows, setRows] = useState(initialRows);
    const inputRefs = useRef([]);

    const handleAddRow = () => {
        const newRow = {
            id: Date.now(),
            sl: rows.length + 1,
            product: null,
            productId: null,
            color: null,
            size: null,
            price: "",
            qty: 1,
            discountPercentage: "",
            discountAmount: "",
            warranty: "",
            total: 0,
        };
        setRows((prevRows) => {
            const updatedRows = [...prevRows, newRow];
            inputRefs.current = updatedRows.map(() => ({
                product: null,
                price: null,
                qty: null,
                discountPercentage: null,
                discountAmount: null,
                warranty: null,
            }));
            return updatedRows;
        });
        setTimeout(() => {
            const newRowIndex = rows.length;
            if (inputRefs.current[newRowIndex]?.product) {
                inputRefs.current[newRowIndex].product.focus();
            }
        }, 100);
    };

    const handleDeleteRow = (id) => {
        if (rows.length > 1) {
            setRows((prevRows) =>
                prevRows
                    .filter((row) => row.id !== id)
                    .map((row, index) => ({
                        ...row,
                        sl: index + 1,
                    }))
            );
        }
    };

    return { rows, setRows, handleAddRow, handleDeleteRow, inputRefs };
};

export default useTableRows;
