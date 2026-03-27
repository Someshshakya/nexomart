const vendorDashboardFallback = {
  stats: {
    monthlyRevenue: 84210,
    monthlyRevenueGrowth: 12,
    totalOrders: 186,
    productsListed: 34,
    commissionDue: 2414,
  },
  recentOrders: [
    {
      id: 'V-10091',
      customerName: 'Rohit Malhotra',
      product: 'Wireless Earbuds Pro',
      amount: 2499,
      status: 'pending',
    },
    {
      id: 'V-10087',
      customerName: 'Neha Kulkarni',
      product: 'Yoga Mat Premium Grip',
      amount: 899,
      status: 'confirmed',
    },
    {
      id: 'V-10070',
      customerName: 'Arjun Reddy',
      product: 'Smartwatch Active X',
      amount: 3999,
      status: 'shipped',
    },
  ],
  lowStock: [
    { id: 'p1', name: 'Wireless Earbuds Pro', stock: 3 },
    { id: 'p8', name: 'Phone Case Carbon', stock: 2 },
  ],
}

const vendorProductsFallback = [
  {
    id: 'p1',
    image: '',
    name: 'Wireless Earbuds Pro',
    category: 'Electronics',
    price: 2499,
    stock: 3,
    sales: 120,
    status: 'active',
  },
  {
    id: 'p2',
    image: '',
    name: 'Smartwatch Active X',
    category: 'Electronics',
    price: 3999,
    stock: 20,
    sales: 84,
    status: 'active',
  },
  {
    id: 'p9',
    image: '',
    name: 'Fitness Band Lite',
    category: 'Sports',
    price: 1499,
    stock: 0,
    sales: 58,
    status: 'inactive',
  },
  {
    id: 'p12',
    image: '',
    name: 'Portable Lamp Mini',
    category: 'Home',
    price: 699,
    stock: 12,
    sales: 17,
    status: 'draft',
  },
]

export async function getVendorDashboard() {
  try {
    const response = await fetch('/vendor/dashboard')
    if (!response.ok) throw new Error('Failed dashboard fetch')
    return response.json()
  } catch {
    return vendorDashboardFallback
  }
}

export async function updateVendorOrderStatus(id, status) {
  try {
    const response = await fetch(`/vendor/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!response.ok) throw new Error('Failed status update')
    return response.json()
  } catch {
    return { id, status }
  }
}

export async function getVendorProducts() {
  try {
    const response = await fetch('/vendor/products')
    if (!response.ok) throw new Error('Failed vendor products fetch')
    const data = await response.json()
    return Array.isArray(data) ? data : data?.products || []
  } catch {
    return vendorProductsFallback
  }
}

export async function deleteProduct(id) {
  try {
    const response = await fetch(`/vendor/products/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Failed delete')
    return { id }
  } catch {
    return { id }
  }
}

export async function updateVendorProductStatus(id, status) {
  try {
    const response = await fetch(`/vendor/products/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!response.ok) throw new Error('Failed status update')
    return response.json()
  } catch {
    return { id, status }
  }
}

export async function getVendorProductById(id) {
  const list = await getVendorProducts()
  return list.find((p) => String(p.id) === String(id)) || null
}

export async function createProduct(payload) {
  try {
    const response = await fetch('/vendor/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error('Failed create')
    return response.json()
  } catch {
    return { id: `p-${Date.now()}`, ...payload }
  }
}

export async function updateProduct(id, payload) {
  try {
    const response = await fetch(`/vendor/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error('Failed update')
    return response.json()
  } catch {
    return { id, ...payload }
  }
}
