import axios from "axios";
import { useEffect, useState } from "react";

const useDataFetch = (url, defaultValue, options = {}) => {
    const { params } = options;
    const [data, setData] = useState(defaultValue);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(url, { params });
                setData(response.data);
            } catch (err) {
                setError(err.response?.data?.error || err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [url, params]);

    return { data, isLoading, error, setData };
};

export default useDataFetch;
