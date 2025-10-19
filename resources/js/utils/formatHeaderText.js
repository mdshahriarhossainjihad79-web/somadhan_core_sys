export const formatHeaderText = (text) => {
    if (!text) return "N/A";
    return text
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};