import { create } from 'zustand'

/**
 * @typedef {{ id?: string; name: string; email?: string; role: 'customer' | 'vendor' | 'admin' }} AuthUser
 */

export const useAuthStore = create((set) => ({
  /** @type {AuthUser | null} */
  user: null,
  token: null,

  /** @param {AuthUser | null} user */
  setUser: (user) => set({ user }),

  /** @param {AuthUser} user @param {string} token */
  setAuth: (user, token) => set({ user, token }),

  logout: () => set({ user: null, token: null }),
}))
