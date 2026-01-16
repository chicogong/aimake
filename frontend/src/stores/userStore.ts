/**
 * User Store
 * Zustand store for user state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, QuotaInfo } from '@/types';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateQuota: (quota: Partial<QuotaInfo>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, error: null }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      updateQuota: (quota) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                quota: { ...state.user.quota, ...quota },
              }
            : null,
        })),

      clearUser: () => set({ user: null, error: null }),
    }),
    {
      name: 'aimake-user',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
