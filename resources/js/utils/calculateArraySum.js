const calculateArraySum = (array, field) => {
    // Check if array is valid and not empty
    if (!Array.isArray(array) || array.length === 0) {
        return 0;
    }

    // Use reduce to sum up the specified field
    return array.reduce((acc, item) => {
        // Ensure item exists and field is accessible
        const value = item && item[field] !== undefined && item[field] !== null
            ? parseFloat(item[field])
            : 0;

        // Add to accumulator if value is a valid number
        return acc + (isNaN(value) ? 0 : value);
    }, 0);
};

export default calculateArraySum;