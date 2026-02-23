import { create } from 'zustand';

interface AuthStore {
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuthenticated: (value: boolean) => void;
  setInitialized: (value: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  isInitialized: false,
  setAuthenticated: (value): void => set({ isAuthenticated: value }),
  setInitialized: (value): void => set({ isInitialized: value }),
  clearAuth: (): void => set({ isAuthenticated: false, isInitialized: false }),
}));
