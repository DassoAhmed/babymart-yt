import { get } from "http";
import { set } from "react-hook-form";
import { create } from "zustand";
import { persist } from "zustand/middleware"; //keep save in real time

type User = {
 _id: string;
 name: string;
 email: string;
 avatar: string;
 role: "admin" | "user" | "deliveryman"
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // Actions
  login: (credendials: {email: string, password: string}) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
  logout: () => void;
  checkIsAdmin: () => boolean;
 };

 const useAuthStore = create <AuthState>()(
    persist((set,get)=> ({
        user: null,
        token: null,
        isAuthenticated:false,
        login: async(Credential)=>{
            try{
             const response = await
            }catch(error){
               console.error("Login error:", error);
               throw error;
            }
        },
        register: async(userData) =>{},
        logout:()=>{},
        checkIsAdmin: () => {},
     }),{
        name: "auth-storage",
 }))


