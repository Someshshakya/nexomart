import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getProduct } from '../services/products'
import { useCartStore } from '../store/cartStore'
import './productDetail.css'

function sanitizeDescription(html = '') {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
}

function toCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`
}

function stars(avg = 0) {
  const rounded = Math.round(avg)
  return `${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)}`
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const [selectedImage, setSelectedImage] = useState('')
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [visibleReviews, setVisibleReviews] = useState(3)
  const [toast, setToast] = useState('')

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
  })

  const images = product?.images?.length ? product.images : ['']
  useEffect(() => {
    if (images[0] !== undefined) setSelectedImage(images[0])
  }, [id, images])

  const stock = product?.stock ?? 0
  const outOfStock = stock <= 0
  const lowStock = stock > 0 && stock <= 5
  const discount =
    product?.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0
  const features = product?.features?.length
    ? product.features.slice(0, 4)
    : ['Assured Quality', 'Fast Delivery', 'Secure Payment', 'Easy Returns']
  const reviews = product?.reviews || []

  const stockBadge = useMemo(() => {
    if (outOfStock) return { text: 'Out of Stock', cls: 'out' }
    if (lowStock) return { text: 'Low Stock', cls: 'low' }
    return { text: `In Stock (${stock} left)`, cls: 'in' }
  }, [outOfStock, lowStock, stock])

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(''), 1600)
  }

  function handleAddToCart() {
    if (!product || outOfStock) return
    for (let i = 0; i < qty; i += 1) addItem(product)
    showToast('Added to cart')
  }

  function handleBuyNow() {
    if (!product || outOfStock) return
    for (let i = 0; i < qty; i += 1) addItem(product)
    navigate('/checkout')
  }

  if (isLoading) return <div className="product-detail-page">Loading product...</div>
  if (!product) return <div className="product-detail-page">Product not found.</div>

  return (
    <div className="product-detail-page">
      <div className="product-detail-layout">
        <div>
          <div className="pd-gallery-main">
            {selectedImage ? (
              <img key={selectedImage} src={selectedImage} alt={product.name} loading="lazy" />
            ) : (
              <span className="pd-fallback" role="img" aria-label="product">
                📦
              </span>
            )}
          </div>
          <div className="pd-thumbs">
            {images.map((img, idx) => (
              <button
                type="button"
                key={`${img}-${idx}`}
                className={`pd-thumb${selectedImage === img ? ' active' : ''}`}
                onClick={() => setSelectedImage(img)}
              >
                {img ? <img src={img} alt={`thumbnail-${idx + 1}`} loading="lazy" /> : '📦'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Link
            to={`/vendors?name=${encodeURIComponent(product.vendorId?.shopName || '')}`}
            className="pd-vendor-link"
          >
            {product.vendorId?.shopName || 'Marketplace Vendor'}
          </Link>
          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-rating">
            <span className="pd-rating-stars">{stars(product.ratings?.average)}</span>
            <span>({product.ratings?.count || 0})</span>
            <a href="#reviews">Write a review</a>
          </div>

          <div className="pd-price-row">
            <span className="pd-price">{toCurrency(product.price)}</span>
            {product.originalPrice ? (
              <span className="pd-original">{toCurrency(product.originalPrice)}</span>
            ) : null}
            {discount > 0 ? <span className="pd-discount">{discount}% OFF</span> : null}
          </div>

          <span className={`pd-stock ${stockBadge.cls}`}>{stockBadge.text}</span>

          <div className="pd-features">
            {features.map((feature) => (
              <span key={feature} className="pd-feature-pill">
                {feature}
              </span>
            ))}
          </div>

          <div className="pd-actions">
            <div className="pd-qty">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={outOfStock}
              >
                -
              </button>
              <span>{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(stock || 1, q + 1))}
                disabled={outOfStock}
              >
                +
              </button>
            </div>

            <div className="pd-cta-row">
              <button
                type="button"
                className="pd-btn outline"
                disabled={outOfStock}
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
              <button
                type="button"
                className="pd-btn solid"
                disabled={outOfStock}
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>
          </div>

          <div className="pd-delivery">
            <span>Free delivery on orders above Rs 999</span>
            <span>7-day easy return policy</span>
            <span>Secure checkout with encrypted payments</span>
          </div>
        </div>
      </div>

      <section className="pd-tabs" id="reviews">
        <div className="pd-tab-head">
          <button
            type="button"
            className={`pd-tab-btn${activeTab === 'description' ? ' active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
            type="button"
            className={`pd-tab-btn${activeTab === 'reviews' ? ' active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
          <button
            type="button"
            className={`pd-tab-btn${activeTab === 'vendor' ? ' active' : ''}`}
            onClick={() => setActiveTab('vendor')}
          >
            Vendor Info
          </button>
        </div>

        {activeTab === 'description' ? (
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizeDescription(
                product.description || '<p>No description available for this product.</p>',
              ),
            }}
          />
        ) : null}

        {activeTab === 'reviews' ? (
          <div>
            {reviews.length === 0 ? <p>No reviews yet.</p> : null}
            {reviews.slice(0, visibleReviews).map((review) => (
              <div key={review.id} className="pd-review">
                <div className="pd-review-head">
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="pd-avatar">{review.name?.[0] || 'U'}</span>
                    <strong>{review.name}</strong>
                  </div>
                  <small>{review.date}</small>
                </div>
                <div className="pd-rating-stars">{stars(review.rating)}</div>
                <p>{review.text}</p>
              </div>
            ))}
            {visibleReviews < reviews.length ? (
              <button
                type="button"
                className="pd-btn outline"
                onClick={() => setVisibleReviews((v) => v + 3)}
              >
                Load More
              </button>
            ) : null}
          </div>
        ) : null}

        {activeTab === 'vendor' ? (
          <div className="pd-vendor-card">
            <h3 style={{ marginTop: 0 }}>{product.vendor?.shopName || product.vendorId?.shopName}</h3>
            <p>Rating: {product.vendor?.rating || product.ratings?.average || 0}</p>
            <p>Total products: {product.vendor?.totalProducts || 0}</p>
            <p>Joined: {product.vendor?.joinedAt || '-'}</p>
            <Link to="/vendors" className="pd-btn solid" style={{ display: 'inline-block' }}>
              Visit Store
            </Link>
          </div>
        ) : null}
      </section>

      {toast ? <div className="pd-toast">{toast}</div> : null}
    </div>
  )
}
