import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getVendorDashboard,
  updateVendorOrderStatus,
} from '../../services/vendor'
import './vendor.css'

const orderStatusOptions = ['pending', 'confirmed', 'shipped', 'delivered']

function toCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`
}

export default function VendorDashboardPage() {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['vendor-dashboard'],
    queryFn: getVendorDashboard,
  })

  const dashboard = data || { stats: {}, recentOrders: [], lowStock: [] }

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateVendorOrderStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['vendor-dashboard'] })
      const prev = queryClient.getQueryData(['vendor-dashboard'])
      queryClient.setQueryData(['vendor-dashboard'], (old) => {
        if (!old) return old
        return {
          ...old,
          recentOrders: (old.recentOrders || []).map((order) =>
            order.id === id ? { ...order, status } : order,
          ),
        }
      })
      return { prev }
    },
    onError: (_error, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(['vendor-dashboard'], context.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard'] })
    },
  })

  return (
    <div className="vendor-page">
      <section className="vendor-grid4">
        <article className="vendor-card">
          <div className="vendor-stat-label">Monthly Revenue</div>
          <div className="vendor-stat-value">{toCurrency(dashboard.stats?.monthlyRevenue)}</div>
          <div className="vendor-growth">↑12% vs last month</div>
        </article>
        <article className="vendor-card">
          <div className="vendor-stat-label">Total Orders</div>
          <div className="vendor-stat-value">{dashboard.stats?.totalOrders || 0}</div>
        </article>
        <article className="vendor-card">
          <div className="vendor-stat-label">Products Listed</div>
          <div className="vendor-stat-value">{dashboard.stats?.productsListed || 0}</div>
        </article>
        <article className="vendor-card">
          <div className="vendor-stat-label">Commission Due</div>
          <div className="vendor-stat-value">{toCurrency(dashboard.stats?.commissionDue)}</div>
        </article>
      </section>

      <section className="vendor-card">
        <h2 style={{ marginTop: 0 }}>Recent Orders</h2>
        <div className="vendor-table-wrap">
          <table className="vendor-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {(dashboard.recentOrders || []).map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customerName}</td>
                  <td>{order.product}</td>
                  <td>{toCurrency(order.amount)}</td>
                  <td>{order.status}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        statusMutation.mutate({ id: order.id, status: e.target.value })
                      }
                    >
                      {orderStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="vendor-card">
        <h2 style={{ marginTop: 0 }}>Low Stock Alerts</h2>
        {(dashboard.lowStock || []).map((product) => (
          <div
            key={product.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '0.45rem',
            }}
          >
            <span>
              {product.name} <small style={{ color: 'var(--color-text-muted)' }}>(Stock: {product.stock})</small>
            </span>
            <button type="button" className="vendor-btn">
              Restock
            </button>
          </div>
        ))}
      </section>

      <section className="vendor-card">
        <h2 style={{ marginTop: 0 }}>Commission Summary</h2>
        <p style={{ margin: 0 }}>
          <strong>{toCurrency(dashboard.stats?.commissionDue)}</strong> due — paid on 1st of next month
        </p>
      </section>
    </div>
  )
}
