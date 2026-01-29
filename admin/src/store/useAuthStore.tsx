import { api } from "@/lib/api";
import { create } from "zustand";
import { persist } from "zustand/middleware"; //keep save in real time

type User = {
 _id: string;
 name: string;
 email: string;
 avatar: string;
 role: "admin" | "user" | "deliveryman";
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // Actions
  login: (credentials: {email: string, password: string}) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role: "admin" | "user" | "deliveryman";
    avatar?: string;
  }) => Promise<void>;
  logout: () => void;
  checkIsAdmin: () => boolean;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
};

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          //  Actual API endpoint
          const response = await api.post("/auth/login", credentials);
          if (response.data.token) {
          set({
            user: response.data,
            token: response.data.token,
            isAuthenticated: true,
          });
          } 
        } catch (error) {
          console.error("Login error:", error);
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
       //  Actual API endpoint
          const response = await api.post("/auth/register", userData);
          if (response.data.token) {
          set({
            user: response.data,
            token: response.data.token,
            isAuthenticated: true,
          });
          } 
        } catch (error) {
          console.error("Registration error:", error);
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        // Optional: Clear from localStorage completely
        localStorage.removeItem("auth-storage");
      },

      checkIsAdmin: () => {
        const { user } = get();
        return user?.role === "admin";
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "auth-storage",
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;

// Optional utility hooks for easier access
export const useIsAuthenticated = () => {
  return useAuthStore((state) => state.isAuthenticated);
};

export const useCurrentUser = () => {
  return useAuthStore((state) => state.user);
};

export const useIsAdmin = () => {
  return useAuthStore((state) => state.checkIsAdmin());
};

export const useAuthLoading = () => {
  return useAuthStore((state) => state.isLoading);
};

export const useAuthError = () => {
  return useAuthStore((state) => state.error);
};