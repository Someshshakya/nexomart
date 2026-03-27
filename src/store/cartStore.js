import { create } from 'zustand'

/**
 * @typedef {{ id: string; quantity: number }} CartItem
 */

export const useCartStore = create((set, get) => ({
  /** @type {CartItem[]} */
  items: [],

  /** @param {CartItem[]} items */
  setItems: (items) => set({ items }),

  addItem: (product) =>
    set((state) => {
      const id = product?._id ?? product?.id
      if (!id) return state
      const existing = state.items.find((item) => item.id === id)
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity: (item.quantity ?? 1) + 1 }
              : item,
          ),
        }
      }
      return { items: [...state.items, { id, quantity: 1 }] }
    }),

  getTotalCount: () =>
    get().items.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
}))
