// Delaying to search after, user input, not to search on every input, delaying for 500ms to search
import { useState, useEffect } from "react";

function useDebounce<T>(value: T, delay?: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay || 500);

        return () => {
            clearTimeout(timer);
        }
    }, [value, delay])

    return debouncedValue;
}

export default useDebounce;