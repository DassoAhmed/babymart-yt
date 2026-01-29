import axios from "axios";
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";

// Configuration utility for Admin API
interface AdminApiConfig {
    baseURL: string;
    isProduction: boolean;
}

// Get API Configuration for Admin
export const getAdminApiConfig = (): AdminApiConfig => {
    const apiUrl = import.meta.env.VITE_API_URL;

    // app not to break
    if (!apiUrl) {
        throw new Error("VITE_API_URL environment variable not defined");
    }
    
    const isProduction =
        import.meta.env.VITE_APP_ENV === "production" ||
        import.meta.env.PROD === true;

    return {
        baseURL: `${apiUrl}/api`,
        isProduction,
    };
};

// Create configuration for axios instance
const createAxiosInstance = (): AxiosInstance => {
    const { baseURL } = getAdminApiConfig();

    const instance = axios.create({
        baseURL,
        headers: {
            "Content-Type": "application/json",
        },
        withCredentials: true,
        timeout: 60000, // 60 seconds timeout
    });

    // Request interceptor to add token to headers
    instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            // Get token from localStorage (Zustand persist store it there)
            const authData = localStorage.getItem("auth-storage");
            if (authData) {
                try {
                    const parsedData = JSON.parse(authData);
                    // Corrected: Zustand persist structure is { state: { token: 'xxx', ... }, version: 0 }
                    const token = parsedData.state?.token; // Fixed: was parsedData.this.state?.token
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                } catch (error) {
                    console.error("Error parsing auth data:", error);
                }
            }
            
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor for error handling
    instance.interceptors.response.use(
        (response: AxiosResponse) => response,
        (error) => {
            if (error.code === "ERR_NETWORK") {
                console.error(
                    "Network Error: Unable to connect to the server. Please check if the server is running"
                );
            }
            
            // Handle 401 unauthorized errors
            if (error.response?.status === 401) {
                // Clear auth data and redirect to login
                localStorage.removeItem("auth-storage");
                window.location.href = "/login";
            }
            
            return Promise.reject(error);
        }
    );

    return instance;
};

// Create and export the configured axios instance
export const adminApi = createAxiosInstance(); // Fixed: was createApiInstance()

// Admin API endpoints
export const ADMIN_API_ENDPOINTS = {
    // AUTH
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",

    // Users
    USERS: "/users",
    USER_BY_ID: (id: string) => `/users/${id}`,
    
    // Products
    PRODUCTS: "/products",
    PRODUCT_BY_ID: (id: string) => `/products/${id}`,
    
    // Categories
    CATEGORIES: "/categories",
    CATEGORY_BY_ID: (id: string) => `/categories/${id}`,
    
} as const;

// Enhanced helper function to build query parameters
export const buildAdminQueryParams = (
    params: Record<string, string | number | boolean | undefined | null | string[] | number[]>
): string => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        
        if (Array.isArray(value)) {
            // Handle array values (e.g., multiple selections)
            value.forEach(item => {
                if (item !== undefined && item !== null && item !== "") {
                    searchParams.append(key, String(item));
                }
            });
        } else if (value !== "") {
            // Handle single values
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
};

export default adminApi;