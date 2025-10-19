import axios from "axios";
import toast from "react-hot-toast";

const useSubmitSale = () => {
    const submitSale = async (url, data, successMessage) => {
        try {
            const response = await axios.post(url, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            // console.log("response", response);

            if (response.data.status !== 201) {
                throw new Error(
                    response.data.message || "Unexpected response from server."
                );
            }

            toast.success(successMessage);

            return response.data;
        } catch (error) {
            // console.error("Error during sale submission:", error);
            console.log(error);

            if (error.response) {
                const { status, data } = error.response;
                if (status === 400) {
                    toast.error(
                        data.message ||
                            "Invalid data provided. Please check your inputs."
                    );
                } else if (status === 401) {
                    toast.error("Unauthorized access. Please log in again.");
                } else if (status === 403) {
                    toast.error(
                        "You do not have permission to perform this action."
                    );
                } else if (status === 422) {
                    const serverErrors = data.errors || {};
                    Object.entries(serverErrors).forEach(([key, messages]) => {
                        messages.forEach((message) => toast.error(message));
                    });
                } else if (status === 500) {
                    toast.error(
                        "Server error occurred. Please try again later."
                    );
                } else {
                    toast.error(
                        `Request failed with status ${status}. Please try again.`
                    );
                }
            } else if (error.request) {
                toast.error(
                    "Network error. Please check your internet connection and try again."
                );
            } else {
                toast.error("An unexpected error occurred. Please try again.");
            }

            throw error; // Rethrow if component needs to handle further
        }
    };

    return submitSale;
};

export default useSubmitSale;
