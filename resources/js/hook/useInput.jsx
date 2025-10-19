import { useState } from "react";

const useInput = (initialValue, options = {}) => {
    const { min, max, type = "text" } = options;
    const [value, setValue] = useState(initialValue);

    const handleChange = (e) => {
        let newValue = e.target.value;
        if (type === "number") {
            if (newValue === "") {
                setValue("");
                return;
            }
            newValue = parseFloat(newValue);
            if (isNaN(newValue)) return;
            if (min !== undefined && newValue < min) return;
            if (max !== undefined && newValue > max) return;
        }
        setValue(newValue);
    };

    return [value, handleChange, setValue];
};

export default useInput;
