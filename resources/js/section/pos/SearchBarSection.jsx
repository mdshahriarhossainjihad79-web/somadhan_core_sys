import { useState } from "react";
import SelectSearch from "../../components/SelectSearch";

const SearchBarSection = ({ productOptions, addToCart }) => {
    const [selectedProduct, setSelectedProduct] = useState({});

    const handleProductSelect = (option) => {
        if (option) {
            setSelectedProduct({
                value: option.value,
                label: option.label,
            });
            // Add the selected product to the cart
            addToCart(option.product, 1);
        } else {
            setSelectedProduct(null);
        }
    };

    return (
        <div className="relative flex items-center">
            <SelectSearch
                options={productOptions}
                onSelect={handleProductSelect}
                placeholder="Search for a Products..."
                selectedValue={selectedProduct}
                inputClass={`relative py-1 w-full text-sm text-text dark:text-text-dark bg-surface-light dark:bg-surface-dark border border-gray-300 dark:border-gray-600 rounded-md`}
                buttonClass={`py-1 border border-l-0  text-sm`}
                wrapperClass={"w-full lg:w-64"}
                zIndex={50}
            />
        </div>
    );
};

export default SearchBarSection;
