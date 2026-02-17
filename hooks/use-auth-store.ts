"use client";

import { create } from "zustand";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clear: () => set({ user: null }),
}));
