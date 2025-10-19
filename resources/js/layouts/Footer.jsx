const Footer = ({ isSidebarOpen }) => {
    return (
        <footer
            className={`bg-gray-800 text-white p-2 text-center transition-all duration-300 ${
                isSidebarOpen
                    ? "ml-64 w-[calc(100%-16rem)]"
                    : "ml-16 w-[calc(100%-4rem)]"
            }`}
        >
            <p className="text-sm">
                &copy; {new Date().getFullYear()} All Rights Reserved
            </p>
        </footer>
    );
};

export default Footer;
