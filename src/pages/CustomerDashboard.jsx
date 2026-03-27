import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getMyOrders } from '../services/orders'
import { api } from '../services/api'
import { useAuthStore } from '../store/authStore'
import './customerDashboard.css'

function toCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`
}

function maskName(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n, i) => (i === 0 ? n : `${n[0]}.`))
    .join(' ')
}

function statusClass(status = '') {
  const val = status.toLowerCase()
  if (val === 'pending') return 'pending'
  if (val === 'shipped') return 'shipped'
  if (val === 'delivered') return 'delivered'
  if (val === 'cancelled') return 'cancelled'
  return 'pending'
}

async function getMyStats() {
  try {
    return await api.get('/users/me/stats')
  } catch {
    return {
      totalOrders: 24,
      totalSpent: 18450,
      commissionThisMonth: 1260,
      walletBalance: 2430,
      referralCode: 'FREEFREE-A1B2C3',
      referralLevels: [
        { level: 'L1', members: 3, earned: 890 },
        { level: 'L2', members: 7, earned: 245 },
        { level: 'L3', members: 12, earned: 119 },
      ],
      recentEarnings: [
        { name: 'Rahul Sharma', date: '2026-03-20', amount: 180, level: 'L1' },
        { name: 'Priya Mehta', date: '2026-03-18', amount: 95, level: 'L2' },
        { name: 'Aman Verma', date: '2026-03-15', amount: 54, level: 'L3' },
      ],
    }
  }
}

export default function CustomerDashboard() {
  const user = useAuthStore((s) => s.user)
  const [copied, setCopied] = useState('')
  const [expanded, setExpanded] = useState(false)

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders'],
    queryFn: getMyOrders,
  })

  const { data: stats = {} } = useQuery({
    queryKey: ['my-stats'],
    queryFn: () => api.get('/users/me/stats').catch(() => getMyStats()),
  })

  const referralCode = stats.referralCode || 'FREEFREE-XXXXXX'
  const referralLink = useMemo(
    () => `https://freefree.in/register?ref=${encodeURIComponent(referralCode)}`,
    [referralCode],
  )

  async function copyText(text, type) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(''), 1400)
    } catch {
      setCopied('')
    }
  }

  function shareLink() {
    if (navigator.share) {
      navigator.share({ title: 'Join freefree.in', url: referralLink }).catch(() => {})
      return
    }
    copyText(referralLink, 'share')
  }

  return (
    <div className="customer-dashboard">
      <section className="cd-header">
        <div>
          <h1 style={{ margin: 0 }}>Hello, {user?.name || 'Customer'}</h1>
          <small style={{ color: 'var(--color-text-muted)' }}>
            Manage your orders, referrals, and wallet in one place.
          </small>
        </div>
        <button
          type="button"
          className="cd-ref-badge"
          onClick={() => copyText(referralCode, 'code')}
        >
          {referralCode} {copied === 'code' ? '✓ Copied' : ''}
        </button>
      </section>

      <section className="cd-grid4">
        <article className="cd-card">
          <div className="cd-stat-label">Total Orders</div>
          <div className="cd-stat-value">{stats.totalOrders ?? orders.length}</div>
        </article>
        <article className="cd-card">
          <div className="cd-stat-label">Total Spent</div>
          <div className="cd-stat-value">{toCurrency(stats.totalSpent)}</div>
        </article>
        <article className="cd-card">
          <div className="cd-stat-label">Commission This Month</div>
          <div className="cd-stat-value">{toCurrency(stats.commissionThisMonth)}</div>
        </article>
        <article className="cd-card">
          <div className="cd-stat-label">Wallet Balance</div>
          <div className="cd-stat-value">{toCurrency(stats.walletBalance)}</div>
          <button type="button" className="cd-btn" style={{ marginTop: '0.45rem' }}>
            Withdraw
          </button>
        </article>
      </section>

      <section className="cd-card">
        <h2 style={{ marginTop: 0 }}>Recent Orders</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="cd-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((order) => (
                <tr key={order.id || order._id}>
                  <td>{order.id || order._id}</td>
                  <td>{order.createdAt}</td>
                  <td>{order.itemCount || order.items?.length || 0}</td>
                  <td>{toCurrency(order.total)}</td>
                  <td>
                    <span className={`cd-status ${statusClass(order.status)}`}>{order.status}</span>
                  </td>
                  <td>
                    <Link className="cd-link" to={`/orders/${order.id || order._id}`}>
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '0.6rem' }}>
          <Link className="cd-link" to="/orders/my">
            View All Orders
          </Link>
        </div>
      </section>

      <section className="cd-card">
        <h2 style={{ marginTop: 0 }}>Referral Network</h2>
        <div className="cd-ref-link-row">
          <input readOnly value={referralLink} />
          <button type="button" className="cd-btn" onClick={() => copyText(referralLink, 'link')}>
            {copied === 'link' ? 'Copied' : 'Copy'}
          </button>
          <button type="button" className="cd-btn" onClick={shareLink}>
            Share
          </button>
        </div>

        <div style={{ marginTop: '0.75rem' }}>
          {(stats.referralLevels || []).map((row) => (
            <div key={row.level} className="cd-level-row">
              <span className="cd-pill">{row.level}</span>
              <span>{row.members} members</span>
              <strong>{toCurrency(row.earned)}</strong>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="cd-btn"
          style={{ marginTop: '0.5rem' }}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Hide' : 'How it works'}
        </button>
        {expanded ? (
          <p style={{ marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>
            Earn referral commissions up to 5 levels. L1 gives the highest commission rate, then
            rates taper down through L2, L3, L4 and L5 on qualifying purchases.
          </p>
        ) : null}
      </section>

      <section className="cd-card">
        <h2 style={{ marginTop: 0 }}>Recent Earnings</h2>
        {(stats.recentEarnings || []).map((earning, idx) => (
          <div key={`${earning.name}-${idx}`} className="cd-earn-row">
            <span>{maskName(earning.name)}</span>
            <small style={{ color: 'var(--color-text-muted)' }}>{earning.date}</small>
            <span>
              <strong>{toCurrency(earning.amount)}</strong> <span className="cd-pill">{earning.level}</span>
            </span>
          </div>
        ))}
      </section>
    </div>
  )
}
