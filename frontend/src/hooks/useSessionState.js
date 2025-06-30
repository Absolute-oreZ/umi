import { useState, useEffect } from "react";

export const useSessionState = (key, initialValue) => {
    const [state, setState] = useState(() => {
        const stored = sessionStorage.getItem(key);

        if (stored === null) return initialValue;

        if (stored === "true") return true;
        if (stored === "false") return false;

        if (!isNaN(Number(stored)) && typeof initialValue === "number")
            return Number(stored);

        return stored;
    });

    useEffect(() => {
        if (typeof state === "object") {
            sessionStorage.setItem(key, JSON.stringify(state));
        } else {
            sessionStorage.setItem(key, state);
        }
    }, [key, state]);

    return [state, setState];
};