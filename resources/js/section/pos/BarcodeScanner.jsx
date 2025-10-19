import { Icon } from "@iconify/react";
import { debounce } from "lodash";
import { useCallback, useState } from "react";

const BarcodeScanner = ({ onScan }) => {
    const [barcode, setBarcode] = useState("");

    const debouncedScan = useCallback(
        debounce((value) => {
            if (value) {
                onScan(value);
                setBarcode("");
            }
        }, 300),
        [onScan]
    );

    const handleChange = (e) => {
        const value = e.target.value.trim();
        setBarcode(value);
        debouncedScan(value);
    };

    return (
        <div className="relative flex items-center">
            <Icon
                icon="mdi:barcode"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
            />
            <input
                type="text"
                value={barcode}
                onChange={handleChange}
                placeholder="Scan Barcode..."
                className="pl-8 pr-4 py-1 border text-sm rounded-md w-full lg:w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
        </div>
    );
};

export default BarcodeScanner;
