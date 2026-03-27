import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approveVendor,
  getAdminStats,
  getCommissions,
  getVendors,
  processCommissionPayouts,
} from '../services/admin'

export function useAdminStats(filters = {}) {
  const range = filters?.range ?? '30'
  return useQuery({
    queryKey: ['admin-stats', filters],
    queryFn: () => getAdminStats(range),
    staleTime: 30 * 1000,
  })
}

export function useVendors(filters = {}) {
  return useQuery({
    queryKey: ['vendors', filters],
    queryFn: () => getVendors(filters),
    staleTime: 30 * 1000,
  })
}

export function useApproveVendor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: approveVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}

export function useCommissions(filters = {}) {
  return useQuery({
    queryKey: ['commissions', filters],
    queryFn: () => getCommissions(filters),
    staleTime: 45 * 1000,
  })
}

export function useProcessPayouts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: processCommissionPayouts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}
