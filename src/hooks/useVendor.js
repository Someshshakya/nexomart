import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProduct,
  deleteProduct,
  getVendorDashboard,
  getVendorProducts,
  updateProduct,
} from '../services/vendor'

export function useVendorDashboard() {
  return useQuery({
    queryKey: ['vendor-dashboard'],
    queryFn: getVendorDashboard,
    staleTime: 30 * 1000,
  })
}

export function useVendorProducts(filters = {}) {
  return useQuery({
    queryKey: ['vendor-products', filters],
    queryFn: () => getVendorProducts(filters),
    staleTime: 45 * 1000,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] })
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard'] })
    },
  })
}

export function useUpdateProduct(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] })
      queryClient.invalidateQueries({ queryKey: ['vendor-product', id] })
    },
  })
}

export function useDeleteProduct(confirmFn = null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const ok =
        typeof confirmFn === 'function'
          ? await Promise.resolve(confirmFn(id))
          : window.confirm('Are you sure you want to delete this product?')
      if (!ok) throw new Error('Delete cancelled')
      return deleteProduct(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] })
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard'] })
    },
  })
}
