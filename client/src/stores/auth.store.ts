import { create } from 'zustand';

import { type UserResponse } from '@shared/types';

type AuthState = {
  user: UserResponse | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserResponse, accessToken: string) => void;
  setToken: (accessToken: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
  setToken: (accessToken) => set({ accessToken }),
  clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}));
