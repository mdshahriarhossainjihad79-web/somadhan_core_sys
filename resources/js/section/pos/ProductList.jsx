import SelectSearch from "../../components/SelectSearch";
import { Icon } from "@iconify/react";
import calculateArraySum from "../../utils/calculateArraySum";
import cn from "../../utils/cn";

const ProductList = ({ products, addToCart, setting, promotionDetails }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 2xl:grid-col-8 gap-2 max-h-[70vh] overflow-y-auto">
            {products.map((product) => (
                <div
                    key={product.id}
                    className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => addToCart(product, 1)}
                >
                    {product.image ? (
                        <div className="w-full h-24 flex items-center justify-center bg-white dark:bg-gray-900 rounded-md mb-2">
                            <img
                                src={`/uploads/products/${product.image}`}
                                alt={product?.product?.name ?? "N/A"}
                                className="w-full h-24 object-contain rounded-md py-1"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-24 flex items-center justify-center bg-white dark:bg-gray-900 rounded-md mb-2">
                            <Icon
                                icon="mdi:package-variant"
                                className="h-12 w-12 text-gray-400 dark:text-gray-500"
                            />
                        </div>
                    )}
                    <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {product?.product?.name ?? "N/A"}{" "}
                        <span>({product?.color_name?.name ?? "N/A"})</span>
                    </h3>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {product?.variation_size?.size ?? "N/A"}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                <span
                                    className={cn(
                                        `${
                                            calculateArraySum(
                                                product?.stocks,
                                                "stock_quantity"
                                            ) > 0
                                                ? ""
                                                : "text-red-500"
                                        }`
                                    )}
                                >
                                    {calculateArraySum(
                                        product?.stocks,
                                        "stock_quantity"
                                    )}
                                </span>{" "}
                                {product?.product?.product_unit?.name ?? "pc"}{" "}
                                available
                            </p>
                        </div>
                        <p className="text-sm sm:text-sm font-medium text-gray-800 dark:text-gray-200">
                            {setting?.sale_price_type === "b2c_price"
                                ? product?.b2c_price
                                : product?.b2b_price}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductList;
