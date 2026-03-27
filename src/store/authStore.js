import { create } from 'zustand'

/**
 * @typedef {{ id?: string; name: string; email?: string; role: 'customer' | 'vendor' | 'admin' }} AuthUser
 */

export const useAuthStore = create((set) => ({
  /** @type {AuthUser | null} */
  user: null,

  /** @param {AuthUser | null} user */
  setUser: (user) => set({ user }),

  logout: () => set({ user: null }),
}))
