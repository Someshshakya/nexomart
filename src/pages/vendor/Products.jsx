import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteProduct,
  getVendorProducts,
  updateVendorProductStatus,
} from '../../services/vendor'
import './vendor.css'

const tabs = ['All', 'Active', 'Out of Stock', 'Draft']

function toCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`
}

export default function VendorProductsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('All')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data: products = [] } = useQuery({
    queryKey: ['vendor-products'],
    queryFn: getVendorProducts,
  })

  const filtered = useMemo(() => {
    if (activeTab === 'All') return products
    if (activeTab === 'Active') return products.filter((p) => p.status === 'active')
    if (activeTab === 'Out of Stock') return products.filter((p) => Number(p.stock || 0) <= 0)
    if (activeTab === 'Draft') return products.filter((p) => p.status === 'draft')
    return products
  }, [products, activeTab])

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }) => updateVendorProductStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['vendor-products'] })
      const prev = queryClient.getQueryData(['vendor-products'])
      queryClient.setQueryData(['vendor-products'], (old = []) =>
        old.map((p) => (p.id === id ? { ...p, status } : p)),
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['vendor-products'], ctx.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['vendor-products'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendor-products'] }),
  })

  return (
    <div className="vendor-page">
      <section className="vendor-card">
        <div className="vendor-topbar">
          <h2 style={{ margin: 0 }}>My Products ({products.length})</h2>
          <Link to="/vendor/products/new" className="vendor-btn primary">
            + Add Product
          </Link>
        </div>

        <div className="vendor-tabs" style={{ marginTop: '0.7rem' }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`vendor-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      <section className="vendor-card">
        <div className="vendor-table-wrap">
          <table className="vendor-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Sales</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td>{product.image ? <img src={product.image} width="36" height="36" alt="" /> : '📦'}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{toCurrency(product.price)}</td>
                  <td>{product.stock}</td>
                  <td>{product.sales}</td>
                  <td>
                    <button
                      type="button"
                      className={`vendor-status-chip ${
                        product.status === 'active'
                          ? 'vendor-status-active'
                          : product.status === 'draft'
                            ? 'vendor-status-draft'
                            : 'vendor-status-inactive'
                      }`}
                      onClick={() =>
                        toggleMutation.mutate({
                          id: product.id,
                          status: product.status === 'active' ? 'inactive' : 'active',
                        })
                      }
                    >
                      {product.status}
                    </button>
                  </td>
                  <td>
                    <Link className="vendor-btn" to={`/vendor/products/${product.id}/edit`}>
                      Edit
                    </Link>{' '}
                    <button
                      type="button"
                      className="vendor-btn danger"
                      onClick={() => setDeleteTarget(product)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {deleteTarget ? (
        <>
          <button
            type="button"
            className="vendor-modal-backdrop"
            onClick={() => setDeleteTarget(null)}
            aria-label="Close modal"
          />
          <div className="vendor-modal">
            <h3 style={{ marginTop: 0 }}>Delete Product?</h3>
            <p>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.45rem' }}>
              <button type="button" className="vendor-btn" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="vendor-btn danger"
                onClick={() => {
                  deleteMutation.mutate(deleteTarget.id)
                  setDeleteTarget(null)
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
