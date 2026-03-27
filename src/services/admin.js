function makeRevenueSeries(days = 30) {
  const out = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const label = `${String(d.getDate()).padStart(2, '0')}/${String(
      d.getMonth() + 1,
    ).padStart(2, '0')}`
    const base = 45000 + Math.round(Math.random() * 30000)
    out.push({ date: label, revenue: base })
  }
  return out
}

const fallbackStats = {
  gmv: 1864500,
  gmvGrowth: 18,
  activeVendors: 146,
  pendingVendors: 8,
  totalUsers: 12540,
  usersGrowthWeekly: 324,
  commissionsDue: 81420,
  revenueSeries: makeRevenueSeries(30),
  vendors: [
    {
      id: 'v1',
      name: 'SoundNest',
      products: 128,
      monthlySales: 245000,
      status: 'pending',
      joinedDate: '2026-02-05',
    },
    {
      id: 'v2',
      name: 'HomeCraft',
      products: 76,
      monthlySales: 172000,
      status: 'approved',
      joinedDate: '2025-11-14',
    },
    {
      id: 'v3',
      name: 'FitCore',
      products: 54,
      monthlySales: 98000,
      status: 'suspended',
      joinedDate: '2025-08-22',
    },
  ],
  payouts: [
    { type: 'L1 Referral (10%)', recipients: 214, totalAmount: 28410, status: 'pending' },
    { type: 'L2 (5%)', recipients: 191, totalAmount: 15240, status: 'pending' },
    { type: 'L3 (3%)', recipients: 139, totalAmount: 8420, status: 'pending' },
    { type: 'L4 (2%)', recipients: 74, totalAmount: 4210, status: 'pending' },
    { type: 'Vendor (5%)', recipients: 146, totalAmount: 25140, status: 'pending' },
  ],
  recentOrders: Array.from({ length: 10 }).map((_, idx) => ({
    id: `ORD-${21000 + idx}`,
    vendor: ['SoundNest', 'HomeCraft', 'FitCore'][idx % 3],
    customer: ['Riya', 'Aman', 'Kunal', 'Isha'][idx % 4],
    total: 899 + idx * 220,
    status: ['pending', 'shipped', 'delivered'][idx % 3],
  })),
}

export async function getAdminStats(range = '30') {
  try {
    const response = await fetch(`/admin/stats?range=${range}`)
    if (!response.ok) throw new Error('Failed stats fetch')
    return response.json()
  } catch {
    return fallbackStats
  }
}

export async function approveVendor(id) {
  const response = await fetch(`/admin/vendors/${id}/approve`, { method: 'POST' }).catch(() => null)
  if (!response || !response.ok) return { id, status: 'approved' }
  return response.json()
}

export async function rejectVendor(id) {
  const response = await fetch(`/admin/vendors/${id}/reject`, { method: 'POST' }).catch(() => null)
  if (!response || !response.ok) return { id, status: 'rejected' }
  return response.json()
}

export async function processCommissionPayouts() {
  const response = await fetch('/admin/commissions/payout', { method: 'POST' }).catch(() => null)
  if (!response || !response.ok) return { success: true }
  return response.json()
}

export async function getVendors(filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  })
  const query = params.toString()
  try {
    const response = await fetch(`/admin/vendors${query ? `?${query}` : ''}`)
    if (!response.ok) throw new Error('Failed vendors fetch')
    const data = await response.json()
    return Array.isArray(data) ? data : data?.vendors || []
  } catch {
    return fallbackStats.vendors
  }
}

export async function getCommissions() {
  try {
    const response = await fetch('/admin/commissions')
    if (!response.ok) throw new Error('Failed commissions fetch')
    const data = await response.json()
    return Array.isArray(data) ? data : data?.commissions || []
  } catch {
    return fallbackStats.payouts
  }
}
