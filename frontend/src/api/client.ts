import axios from "axios";

import {
    clearAuthSession,
    getToken,
} from "../auth/authStorage";

const api = axios.create({
    baseURL: "http://localhost:5164/api",
});

api.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            clearAuthSession();

            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    },
);

export default api;