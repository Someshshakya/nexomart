import { useQuery } from '@tanstack/react-query'
import { getProducts } from '../services/products'

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => getProducts({ featured: true, limit: 6 }),
  })
}
