const FALLBACK_PRODUCTS = [
  {
    _id: 'p1',
    name: 'Wireless Earbuds Pro',
    price: 2499,
    originalPrice: 3499,
    images: [],
    vendorId: { shopName: 'SoundNest' },
    ratings: { average: 4.5, count: 120 },
    stock: 12,
    badge: 'Hot',
  },
  {
    _id: 'p2',
    name: 'Smartwatch Active X',
    price: 3999,
    originalPrice: 4999,
    images: [],
    vendorId: { shopName: 'TechTrend' },
    ratings: { average: 4.3, count: 84 },
    stock: 20,
    badge: 'Top Rated',
  },
  {
    _id: 'p3',
    name: 'Non-Stick Cookware Set',
    price: 2199,
    originalPrice: 2899,
    images: [],
    vendorId: { shopName: 'HomeCraft' },
    ratings: { average: 4.2, count: 67 },
    stock: 9,
    badge: 'Sale',
  },
  {
    _id: 'p4',
    name: 'Yoga Mat Premium Grip',
    price: 899,
    originalPrice: 1199,
    images: [],
    vendorId: { shopName: 'FitCore' },
    ratings: { average: 4.1, count: 59 },
    stock: 40,
  },
  {
    _id: 'p5',
    name: 'Hardcover Bestseller Bundle',
    price: 1499,
    originalPrice: 1999,
    images: [],
    vendorId: { shopName: 'BookHive' },
    ratings: { average: 4.7, count: 190 },
    stock: 0,
    badge: 'Top Rated',
  },
  {
    _id: 'p6',
    name: 'Organic Grocery Starter Pack',
    price: 999,
    originalPrice: 1299,
    images: [],
    vendorId: { shopName: 'GreenBasket' },
    ratings: { average: 4.0, count: 45 },
    stock: 30,
    badge: 'Sale',
  },
]

export async function getProducts(params = {}) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  try {
    const query = searchParams.toString()
    const response = await fetch(`/api/products${query ? `?${query}` : ''}`)
    if (!response.ok) throw new Error('Failed to fetch products')
    const payload = await response.json()
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.products)) return payload.products
    return FALLBACK_PRODUCTS
  } catch {
    return FALLBACK_PRODUCTS
  }
}
