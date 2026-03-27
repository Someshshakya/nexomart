import { create } from 'zustand'

/**
 * @typedef {{
 * id: string;
 * quantity: number;
 * product?: {
 *   _id?: string;
 *   id?: string;
 *   name?: string;
 *   price?: number;
 *   stock?: number;
 *   images?: string[];
 *   vendorId?: { shopName?: string };
 * }
 * }} CartItem
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
      const stock = Math.max(0, Number(product?.stock ?? 999))
      if (existing) {
        const nextQty = Math.min((existing.quantity ?? 1) + 1, stock || 999)
        return {
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity: nextQty, product: product ?? item.product }
              : item,
          ),
        }
      }
      return {
        items: [
          ...state.items,
          {
            id,
            quantity: stock === 0 ? 0 : 1,
            product: product
              ? {
                  _id: product._id ?? product.id,
                  id: product.id,
                  name: product.name,
                  price: Number(product.price ?? 0),
                  stock: Number(product.stock ?? 999),
                  images: Array.isArray(product.images) ? product.images : [],
                  vendorId: product.vendorId || {},
                }
              : undefined,
          },
        ],
      }
    }),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  updateQty: (id, qty) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== id) return item
        const stock = Math.max(0, Number(item.product?.stock ?? 999))
        const safeQty = Math.max(1, Math.min(Number(qty) || 1, stock || 999))
        return { ...item, quantity: safeQty }
      }),
    })),

  subtotal: () =>
    get().items.reduce(
      (sum, item) => sum + Number(item.product?.price ?? 0) * Number(item.quantity ?? 0),
      0,
    ),

  itemCount: () =>
    get().items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0),

  getTotalCount: () =>
    get().items.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
}))
