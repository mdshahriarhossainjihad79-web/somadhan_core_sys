const ErrorPopover = ({ isOpen, message, position }) => {
    if (!isOpen) return null;

    return (
        <div
            className="absolute bg-red-500 dark:bg-red-600 text-white dark:text-gray-100 text-xs rounded-md px-2 py-1 shadow-lg z-50 transition-opacity duration-200"
            style={{
                top: position.top,
                left: position.left,
                transform: "translateY(4px)",
            }}
        >
            {message}
        </div>
    );
};

export default ErrorPopover;