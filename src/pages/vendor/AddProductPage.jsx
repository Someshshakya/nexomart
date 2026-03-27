import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProduct,
  getVendorProductById,
  updateProduct,
} from '../../services/vendor'
import './vendor.css'

const categories = ['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Beauty', 'Grocery', 'Toys']

export default function VendorAddProductPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    name: '',
    category: 'Electronics',
    price: '',
    originalPrice: '',
    stock: '',
    sku: '',
    description: '',
    status: 'active',
  })
  const [images, setImages] = useState([])
  const [toast, setToast] = useState('')

  const { data: existing } = useQuery({
    queryKey: ['vendor-product', id],
    queryFn: () => getVendorProductById(id),
    enabled: isEdit,
  })

  useEffect(() => {
    if (!existing) return
    setForm({
      name: existing.name || '',
      category: existing.category || 'Electronics',
      price: existing.price || '',
      originalPrice: existing.originalPrice || '',
      stock: existing.stock || '',
      sku: existing.sku || '',
      description: existing.description || '',
      status: existing.status || 'active',
    })
    setImages(existing.image ? [existing.image] : [])
  }, [existing])

  const previews = useMemo(() => images.slice(0, 5), [images])

  const saveMutation = useMutation({
    mutationFn: (payload) => (isEdit ? updateProduct(id, payload) : createProduct(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] })
      setToast('Product saved successfully')
      setTimeout(() => navigate('/vendor/products'), 700)
    },
  })

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleImageFiles(files) {
    const fileList = Array.from(files || [])
    const readers = fileList.slice(0, Math.max(0, 5 - images.length)).map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result || ''))
          reader.readAsDataURL(file)
        }),
    )
    Promise.all(readers).then((urls) => {
      setImages((prev) => [...prev, ...urls].slice(0, 5))
    })
  }

  function submitForm(e) {
    e.preventDefault()
    const payload = {
      ...form,
      price: Number(form.price || 0),
      originalPrice: Number(form.originalPrice || 0),
      stock: Number(form.stock || 0),
      images,
    }
    saveMutation.mutate(payload)
  }

  return (
    <form className="vendor-page" onSubmit={submitForm}>
      <section className="vendor-card">
        <h2 style={{ marginTop: 0 }}>{isEdit ? 'Edit Product' : 'Add Product'}</h2>
        <div className="vendor-form-grid two">
          <div className="vendor-field">
            <label>Product Name</label>
            <input value={form.name} onChange={(e) => setField('name', e.target.value)} required />
          </div>
          <div className="vendor-field">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setField('category', e.target.value)}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="vendor-card">
        <h3 style={{ marginTop: 0 }}>Pricing</h3>
        <div className="vendor-form-grid two">
          <div className="vendor-field">
            <label>Price</label>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setField('price', e.target.value)}
              required
            />
          </div>
          <div className="vendor-field">
            <label>Original Price</label>
            <input
              type="number"
              min="0"
              value={form.originalPrice}
              onChange={(e) => setField('originalPrice', e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="vendor-card">
        <h3 style={{ marginTop: 0 }}>Inventory</h3>
        <div className="vendor-form-grid two">
          <div className="vendor-field">
            <label>Stock</label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setField('stock', e.target.value)}
              required
            />
          </div>
          <div className="vendor-field">
            <label>SKU</label>
            <input value={form.sku} onChange={(e) => setField('sku', e.target.value)} />
          </div>
        </div>
      </section>

      <section className="vendor-card">
        <h3 style={{ marginTop: 0 }}>Images (max 5)</h3>
        <div
          className="vendor-upload"
          onDrop={(e) => {
            e.preventDefault()
            handleImageFiles(e.dataTransfer.files)
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <p style={{ marginTop: 0 }}>Drag & drop images or choose files</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleImageFiles(e.target.files)}
          />
          <div className="vendor-previews">
            {previews.map((img, idx) => (
              <img key={`${img}-${idx}`} src={img} alt={`preview-${idx + 1}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="vendor-card">
        <h3 style={{ marginTop: 0 }}>Description</h3>
        <div className="vendor-field">
          <label>Rich text / details</label>
          <textarea
            rows={6}
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
          />
        </div>
      </section>

      <section className="vendor-card" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
        {toast ? <span style={{ marginRight: 'auto', color: '#027a48', fontWeight: 700 }}>{toast}</span> : null}
        <button type="button" className="vendor-btn" onClick={() => navigate('/vendor/products')}>
          Cancel
        </button>
        <button type="submit" className="vendor-btn primary" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
        </button>
      </section>
    </form>
  )
}
