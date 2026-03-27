const FALLBACK_PRODUCTS = [
  {
    _id: 'p1',
    name: 'Wireless Earbuds Pro',
    category: 'Electronics',
    price: 2499,
    originalPrice: 3499,
    images: [],
    vendorId: { shopName: 'SoundNest' },
    ratings: { average: 4.5, count: 120 },
    stock: 12,
    badge: 'Hot',
    description:
      '<p>Premium earbuds with ANC, low-latency gaming mode, and 30-hour battery life.</p>',
    features: ['ANC', 'Bluetooth 5.3', 'IPX4', 'Fast charging'],
    reviews: [
      {
        id: 'r1',
        name: 'Aarav',
        rating: 5,
        date: '2026-01-11',
        text: 'Great bass and call quality. Value for money.',
      },
      {
        id: 'r2',
        name: 'Diya',
        rating: 4,
        date: '2026-02-03',
        text: 'Comfortable fit and battery lasts all day.',
      },
    ],
    vendor: {
      shopName: 'SoundNest',
      rating: 4.6,
      totalProducts: 128,
      joinedAt: '2023-05-14',
    },
  },
  {
    _id: 'p2',
    name: 'Smartwatch Active X',
    category: 'Electronics',
    price: 3999,
    originalPrice: 4999,
    images: [],
    vendorId: { shopName: 'TechTrend' },
    ratings: { average: 4.3, count: 84 },
    stock: 20,
    badge: 'Top Rated',
    description: '<p>Fitness-first smartwatch with AMOLED display and GPS tracking.</p>',
    features: ['AMOLED', 'GPS', 'Heart-rate', '7-day battery'],
    reviews: [],
    vendor: {
      shopName: 'TechTrend',
      rating: 4.4,
      totalProducts: 92,
      joinedAt: '2022-11-09',
    },
  },
  {
    _id: 'p3',
    name: 'Non-Stick Cookware Set',
    category: 'Home',
    price: 2199,
    originalPrice: 2899,
    images: [],
    vendorId: { shopName: 'HomeCraft' },
    ratings: { average: 4.2, count: 67 },
    stock: 9,
    badge: 'Sale',
    description: '<p>Durable non-stick cookware set for everyday cooking.</p>',
    features: ['PFOA free', 'Induction ready', 'Easy clean', '5-piece set'],
    reviews: [],
    vendor: {
      shopName: 'HomeCraft',
      rating: 4.2,
      totalProducts: 76,
      joinedAt: '2024-01-20',
    },
  },
  {
    _id: 'p4',
    name: 'Yoga Mat Premium Grip',
    category: 'Sports',
    price: 899,
    originalPrice: 1199,
    images: [],
    vendorId: { shopName: 'FitCore' },
    ratings: { average: 4.1, count: 59 },
    stock: 40,
    description: '<p>Anti-slip yoga mat with premium cushioning and textured grip.</p>',
    features: ['6mm cushion', 'Non-slip', 'Lightweight', 'Eco material'],
    reviews: [],
    vendor: {
      shopName: 'FitCore',
      rating: 4.1,
      totalProducts: 54,
      joinedAt: '2023-07-02',
    },
  },
  {
    _id: 'p5',
    name: 'Hardcover Bestseller Bundle',
    category: 'Books',
    price: 1499,
    originalPrice: 1999,
    images: [],
    vendorId: { shopName: 'BookHive' },
    ratings: { average: 4.7, count: 190 },
    stock: 0,
    badge: 'Top Rated',
    description: '<p>Curated bundle of best-selling books across genres.</p>',
    features: ['Hardcover', 'Bestsellers', 'Gift-ready', 'Limited set'],
    reviews: [],
    vendor: {
      shopName: 'BookHive',
      rating: 4.7,
      totalProducts: 204,
      joinedAt: '2021-08-18',
    },
  },
  {
    _id: 'p6',
    name: 'Organic Grocery Starter Pack',
    category: 'Grocery',
    price: 999,
    originalPrice: 1299,
    images: [],
    vendorId: { shopName: 'GreenBasket' },
    ratings: { average: 4.0, count: 45 },
    stock: 30,
    badge: 'Sale',
    description: '<p>Fresh and organic essentials for your weekly pantry stock.</p>',
    features: ['Organic certified', 'Fresh packed', 'Weekly combo', 'Best value'],
    reviews: [],
    vendor: {
      shopName: 'GreenBasket',
      rating: 4.0,
      totalProducts: 143,
      joinedAt: '2024-02-10',
    },
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

export async function getProduct(id) {
  if (!id) return null
  try {
    const response = await fetch(`/api/products/${id}`)
    if (!response.ok) throw new Error('Failed to fetch product')
    const payload = await response.json()
    return payload?.product || payload
  } catch {
    return FALLBACK_PRODUCTS.find((p) => p._id === id) || null
  }
}
