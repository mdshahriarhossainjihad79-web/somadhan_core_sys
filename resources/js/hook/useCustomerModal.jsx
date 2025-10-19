import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

const useCustomerModal = (setSelectedCustomer, setErrors) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customers, setCustomers] = useState([]);

    // Fetch updated customer list
    const fetchCustomers = async () => {
        try {
            const response = await axios.get("/get/customer");
            if (response.data.status === 200) {
                setCustomers(response?.data?.allData);
            } else {
                console.error(response?.data?.message);
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    };

    // Handle modal submit
    const handleModalSubmit = async (formData) => {
        try {
            const response = await axios.post("/customer/add", {
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                address: formData.address,
                opening_receivable: formData.previousDue,
                credit_limit: formData.creditLimit,
            });

            if (response?.data?.status === 200) {
                // Fetch updated customer list
                await fetchCustomers();
                // Select the newly added customer
                const newCustomer = response.data.customer;
                setSelectedCustomer(newCustomer);
                // Close the modal
                setIsModalOpen(false);
                toast.success(
                    response?.data?.message ?? "Customer Add Successful"
                );
                setErrors((prev) => ({
                    ...prev,
                    selectedCustomer: undefined,
                }));
            } else {
                toast.warn(response.data.error || "Failed to add customer.");
            }
        } catch (error) {
            if (error.response?.status === 400) {
                toast.warn(
                    Object.values(error.response.data.error).flat().join("\n")
                );
            } else {
                toast.warn("An unexpected error occurred. Please try again.");
            }
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleButtonClick = () => {
        setIsModalOpen(true);
    };

    return {
        isModalOpen,
        customers,
        setCustomers,
        handleModalSubmit,
        handleModalClose,
        handleButtonClick,
        fetchCustomers,
    };
};

export default useCustomerModal;
