import { create } from "zustand";

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLogginIn: false,
    isUpdatingProfile: false,
     
    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            
        } catch (error) {
            
        }
    }
}))