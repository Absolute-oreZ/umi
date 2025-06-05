import axios from "axios";
import { keycloakInstance } from "../keycloak/keycloakInstance";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Create an axios instance with default configuration
const axiosInstance = axios.create({
    baseURL: backendUrl,
    headers: {
        'Content-Type': "application/json"
    }
});

export const setupAxiosInterceptors = (token) => {
    axiosInstance.interceptors.request.use(
        (config) => {
            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            keycloakInstance.authenticated
        ) {
            originalRequest._retry = true;

            try {
                // attempt to refresh the token
                const refreshed = await keycloakInstance.updateToken(5);
                setupAxiosInterceptors(keycloakInstance.token);
                if (refreshed) {
                    // set the new token
                    originalRequest.headers["Authorization"] = `Bearer ${keycloakInstance.token}`;
                    return axiosInstance(originalRequest);
                } else {
                    // keycloakInstance.logout();
                }
            } catch (refreshError) {
                console.error("🔐 Token refresh failed", refreshError);
                // keycloakInstance.logout();
            }
        }

        return Promise.reject(error);
    }
);


export default axiosInstance;