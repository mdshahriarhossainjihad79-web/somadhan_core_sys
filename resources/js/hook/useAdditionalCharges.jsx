import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const useAdditionalCharges = (
    initialAdditionalChargeItems = [],
    initialAdditionalChargeNames = []
) => {
    const [additionalChargeItems, setAdditionalChargeItems] = useState(
        initialAdditionalChargeItems
    );
    const [tempAdditionalCharges, setTempAdditionalCharges] = useState(
        initialAdditionalChargeItems
    );
    const [additionalChargeModalOpen, setAdditionalChargeModalOpen] =
        useState(false);
    const [newChargeModalOpen, setNewChargeModalOpen] = useState(false);
    const [newChargeName, setNewChargeName] = useState("");
    const [additionalChargeNames, setAdditionalChargeNames] = useState(
        initialAdditionalChargeNames
    );

    // Calculate additional charges total
    const [additionalChargesTotal, setAdditionalChargesTotal] = useState(0);

    useEffect(() => {
        const total = additionalChargeItems.reduce((sum, charge) => {
            const totalCharge = parseFloat(charge.amount) || 0;
            return sum + totalCharge;
        }, 0);
        setAdditionalChargesTotal(total);
    }, [additionalChargeItems]);

    const handleAddAdditionalCharge = () => {
        setTempAdditionalCharges((prev) => [
            ...prev,
            { id: Date.now(), purpose: "", amount: "", additionalChargeId: "" },
        ]);
    };

    const handleChargeChange = (id, field, value) => {
        setTempAdditionalCharges((prev) =>
            prev.map((charge) => {
                if (charge.id === id) {
                    if (field === "purpose") {
                        const selectedCharge = additionalChargeNames.find(
                            (option) => option.id === parseInt(value)
                        );
                        return {
                            ...charge,
                            purpose: selectedCharge ? selectedCharge.name : "",
                            additionalChargeId: value,
                        };
                    }
                    return { ...charge, [field]: value };
                }
                return charge;
            })
        );
    };

    const handleRemoveCharge = (id) => {
        setAdditionalChargeItems((prev) =>
            prev.filter((charge) => charge.id !== id)
        );
        setTempAdditionalCharges((prev) =>
            prev.filter((charge) => charge.id !== id)
        );
    };

    const handleSaveCharges = (charges) => {
        setAdditionalChargeItems(charges);
        setAdditionalChargeModalOpen(false);
    };

    const handleCloseModal = () => {
        setTempAdditionalCharges(additionalChargeItems);
        setAdditionalChargeModalOpen(false);
    };

    const handleSaveNewCharge = async () => {
        if (newChargeName.trim() === "") {
            toast.error("Please enter a valid charge name.");
            return;
        }

        try {
            const response = await axios.post("/additional-charge-name/store", {
                name: newChargeName,
            });

            if (response.status === 200 || response.status === 201) {
                setAdditionalChargeNames((prev) => [
                    ...prev,
                    {
                        id: response.data.data.id,
                        name: newChargeName,
                    },
                ]);
                setNewChargeName("");
                setNewChargeModalOpen(false);
                toast.success("Charge name saved successfully!");
            } else {
                toast.error("Failed to save charge name.");
            }
        } catch (error) {
            console.error("Error saving charge name:", error);
            toast.error("An error occurred while saving the charge name.");
        }
    };

    return {
        additionalChargeItems,
        setAdditionalChargeItems,
        tempAdditionalCharges,
        setTempAdditionalCharges,
        additionalChargeModalOpen,
        setAdditionalChargeModalOpen,
        newChargeModalOpen,
        setNewChargeModalOpen,
        newChargeName,
        setNewChargeName,
        additionalChargeNames,
        setAdditionalChargeNames,
        additionalChargesTotal,
        setAdditionalChargesTotal,
        handleAddAdditionalCharge,
        handleChargeChange,
        handleRemoveCharge,
        handleSaveCharges,
        handleCloseModal,
        handleSaveNewCharge,
    };
};

export default useAdditionalCharges;
