import {
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query'
import { getProduct, getProducts } from '../services/products'

export function useProducts(filters = {}) {
  const query = useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
    staleTime: 60 * 1000,
  })

  const products = Array.isArray(query.data) ? query.data : query.data?.products || []
  const total = query.data?.total ?? products.length

  return {
    products,
    total,
    isLoading: query.isLoading,
    error: query.error,
    ...query,
  }
}

export function useProduct(id) {
  const query = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
    staleTime: 2 * 60 * 1000,
  })

  return {
    product: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    ...query,
  }
}

export function useInfiniteProducts(filters = {}) {
  const query = useInfiniteQuery({
    queryKey: ['products', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => getProducts({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const lastItems = Array.isArray(lastPage) ? lastPage : lastPage?.products || []
      return lastItems.length > 0 ? allPages.length + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 60 * 1000,
  })

  const products = (query.data?.pages || []).flatMap((page) =>
    Array.isArray(page) ? page : page?.products || [],
  )

  return {
    products,
    isLoading: query.isLoading,
    error: query.error,
    ...query,
  }
}
