/**
 * User Store
 * Zustand store for user state management.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, QuotaInfo } from '@/types';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

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
        set((state) => {
          if (!state.user) return state;
          const merged = { ...(state.user.quota ?? {}), ...quota } as QuotaInfo;
          return { user: { ...state.user, quota: merged } };
        }),

      clearUser: () => set({ user: null, error: null }),
    }),
    {
      name: 'aimake-user',
      // Persist identity only. Quota is server-authoritative; persisting it would
      // surface a stale value before /api/auth/me responds on the next page load.
      partialize: (state) => ({
        user: state.user
          ? (() => {
              const { quota: _quota, ...rest } = state.user;
              return rest as User;
            })()
          : null,
      }),
    }
  )
);
