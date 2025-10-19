const CategorySlider = ({
    categories,
    selectedCategory,
    setSelectedCategory,
}) => {
    return (
        <div className="relative flex mb-6 px-4 bg-white dark:bg-gray-800 rounded-sm border overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            <button
                onClick={() => setSelectedCategory("default")}
                className={`flex-shrink-0 px-4 py-2 text-sm sm:font-base transition-colors ${
                    selectedCategory === "default"
                        ? "bg-blue-600 text-white"
                        : "text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
            >
                Default
            </button>
            {categories.map((category) => (
                <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 text-sm sm:font-base transition-colors ${
                        selectedCategory === category.id
                            ? "bg-blue-600 text-white"
                            : "text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                >
                    {category?.name ?? "N/A"}
                </button>
            ))}
        </div>
    );
};

export default CategorySlider;
