const backendUrl = import.meta.env.VITE_BACKEND_URL;
import { supabase } from "../clients/supabaseClient";

let currentToken = null;
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
}

export const setAuthToken = (token) => {
    currentToken = token;
}

export const customFetch = async (url, options = {}) => {
    const requestHeaders = new Headers(options.headers || {});

    if (currentToken) {
        requestHeaders.set("Authorization", `Bearer ${currentToken}`);
    }

    if (options.body) {
        if (!(options.body instanceof FormData)) {
            requestHeaders.set("Content-Type", "application/json");
        }
    }

    const modifiedOptions = {
        ...options,
        headers: requestHeaders,
    };

    const fullUrl = `${backendUrl}${url}`;

    try {
        const response = await fetch(fullUrl, modifiedOptions);

        // handle token expiration
        if (response.status === 401) {
            const originalRequest = { url, options };

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    const { data, error: RefreshError } = await supabase.auth.refreshSession();

                    if (RefreshError) throw RefreshError;

                    const newToken = data.session.access_token;
                    setAuthToken(newToken);
                    isRefreshing = false;

                    // attach new token to auth header
                    requestHeaders.set("Authorization", `Bearer ${newToken}`);


                    const retryResponse = await fetch(fullUrl, {
                        ...options,
                        headers: requestHeaders
                    });

                    processQueue(null, newToken);
                    return retryResponse;
                } catch (error) {
                    processQueue(error, null);
                    setAuthToken(null);
                    throw new Error("Session expired, Please sign in again");
                }
            } else {
                // queue request while refresh is in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return customFetch(originalRequest.url, originalRequest.options);
                })
            }
        }

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: response.statusText || 'Unknown error' }));
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody.message}`);
        }

        return response;
    } catch (error) {
        console.error("Fetch request failed:", error);
        throw error;
    }
}