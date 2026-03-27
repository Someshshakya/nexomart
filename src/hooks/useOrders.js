import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { createOrder, getMyOrders, getOrder } from '../services/orders'
import { updateVendorOrderStatus } from '../services/vendor'
import { useCartStore } from '../store/cartStore'

export function useMyOrders() {
  return useQuery({
    queryKey: ['orders', 'my'],
    queryFn: getMyOrders,
    staleTime: 60 * 1000,
  })
}

export function useOrder(id) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => getOrder(id),
    enabled: Boolean(id),
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateOrder() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const clearCart = useCartStore((s) => s.clearCart)

  return useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      clearCart()
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      navigate(`/orders/${order?.id || order?._id || 'success'}`)
    },
  })
}

export function useUpdateOrderStatus(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status) => updateVendorOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
