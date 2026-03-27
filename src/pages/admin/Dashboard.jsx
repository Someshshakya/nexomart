import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approveVendor,
  getAdminStats,
  processCommissionPayouts,
  rejectVendor,
} from '../../services/admin'
import './dashboard.css'

function toCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`
}

function yTick(value) {
  const num = Number(value || 0)
  if (num >= 100000) return `₹${(num / 100000).toFixed(1).replace('.0', '')}L`
  if (num >= 1000) return `₹${Math.round(num / 1000)}K`
  return `₹${num}`
}

export default function AdminDashboardPage() {
  const queryClient = useQueryClient()
  const [range, setRange] = useState('30')
  const [vendorTab, setVendorTab] = useState('All')
  const [confirmPayoutOpen, setConfirmPayoutOpen] = useState(false)

  const { data } = useQuery({
    queryKey: ['admin-stats', range],
    queryFn: () => getAdminStats(range),
  })

  const stats = data || {
    gmv: 0,
    gmvGrowth: 0,
    activeVendors: 0,
    pendingVendors: 0,
    totalUsers: 0,
    usersGrowthWeekly: 0,
    commissionsDue: 0,
    revenueSeries: [],
    vendors: [],
    payouts: [],
    recentOrders: [],
  }

  const filteredVendors = useMemo(() => {
    if (vendorTab === 'All') return stats.vendors || []
    return (stats.vendors || []).filter((v) => v.status.toLowerCase() === vendorTab.toLowerCase())
  }, [stats.vendors, vendorTab])

  const approveMutation = useMutation({
    mutationFn: (id) => approveVendor(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-stats'] }),
  })
  const rejectMutation = useMutation({
    mutationFn: (id) => rejectVendor(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-stats'] }),
  })
  const payoutMutation = useMutation({
    mutationFn: processCommissionPayouts,
    onSuccess: () => {
      setConfirmPayoutOpen(false)
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  return (
    <div className="admin-dashboard">
      <section className="ad-header">
        <h1 style={{ margin: 0 }}>Platform Overview</h1>
        <div className="ad-actions">
          <select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button type="button" className="ad-btn">Export Report</button>
        </div>
      </section>

      <section className="ad-grid4">
        <article className="ad-stat">
          <div className="ad-stat-label">Total GMV</div>
          <div className="ad-stat-value">{toCurrency(stats.gmv)}</div>
          <div className="ad-stat-meta">↑{stats.gmvGrowth}%</div>
        </article>
        <article className="ad-stat">
          <div className="ad-stat-label">Active Vendors</div>
          <div className="ad-stat-value">{stats.activeVendors}</div>
          <div className="ad-stat-meta">{stats.pendingVendors} pending</div>
        </article>
        <article className="ad-stat">
          <div className="ad-stat-label">Total Users</div>
          <div className="ad-stat-value">{stats.totalUsers}</div>
          <div className="ad-stat-meta">↑{stats.usersGrowthWeekly} this week</div>
        </article>
        <article className="ad-stat">
          <div className="ad-stat-label">Commissions Due</div>
          <div className="ad-stat-value">{toCurrency(stats.commissionsDue)}</div>
        </article>
      </section>

      <section className="ad-card">
        <h2 style={{ marginTop: 0 }}>Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={stats.revenueSeries || []}>
            <XAxis dataKey="date" axisLine={false} tickLine={false} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={yTick}
              width={64}
            />
            <Tooltip formatter={(value) => [toCurrency(value), 'Revenue']} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#E8390E"
              fill="rgba(232, 57, 14, 0.2)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      <section className="ad-card">
        <h2 style={{ marginTop: 0 }}>Vendor Management</h2>
        <div className="ad-tabs">
          {['All', 'Pending', 'Approved', 'Suspended'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`ad-tab${vendorTab === tab ? ' active' : ''}`}
              onClick={() => setVendorTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>Products</th>
                <th>Monthly Sales</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td>{vendor.name}</td>
                  <td>{vendor.products}</td>
                  <td>{toCurrency(vendor.monthlySales)}</td>
                  <td><span className="ad-chip">{vendor.status}</span></td>
                  <td>{vendor.joinedDate}</td>
                  <td>
                    {vendor.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          className="ad-btn green"
                          onClick={() => approveMutation.mutate(vendor.id)}
                        >
                          Approve
                        </button>{' '}
                        <button
                          type="button"
                          className="ad-btn red"
                          onClick={() => rejectMutation.mutate(vendor.id)}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="ad-btn">View</button>{' '}
                        <button type="button" className="ad-btn warn">Suspend</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ad-card">
        <div className="ad-header">
          <h2 style={{ margin: 0 }}>Commission Payouts</h2>
          <button type="button" className="ad-btn" onClick={() => setConfirmPayoutOpen(true)}>
            Process All Payouts
          </button>
        </div>
        <div className="ad-table-wrap" style={{ marginTop: '0.6rem' }}>
          <table className="ad-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Recipients</th>
                <th>Total Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(stats.payouts || []).map((row) => (
                <tr key={row.type}>
                  <td>{row.type}</td>
                  <td>{row.recipients}</td>
                  <td>{toCurrency(row.totalAmount)}</td>
                  <td><span className="ad-chip">{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ad-card">
        <h2 style={{ marginTop: 0 }}>Recent Orders</h2>
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Vendor</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(stats.recentOrders || []).slice(0, 10).map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.vendor}</td>
                  <td>{order.customer}</td>
                  <td>{toCurrency(order.total)}</td>
                  <td><span className="ad-chip">{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {confirmPayoutOpen ? (
        <>
          <button
            type="button"
            className="ad-modal-backdrop"
            onClick={() => setConfirmPayoutOpen(false)}
            aria-label="Close modal"
          />
          <div className="ad-modal">
            <h3 style={{ marginTop: 0 }}>Process all payouts?</h3>
            <p>This will trigger payout processing for all pending commissions.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.45rem' }}>
              <button type="button" className="ad-btn" onClick={() => setConfirmPayoutOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="ad-btn"
                onClick={() => payoutMutation.mutate()}
                disabled={payoutMutation.isPending}
              >
                {payoutMutation.isPending ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
