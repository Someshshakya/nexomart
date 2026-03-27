import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './productCard.css'

function getDiscount(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return 0
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

function toCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`
}

function getStars(avg = 0) {
  const rounded = Math.round(avg)
  return `${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)}`
}

export default function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const {
    _id,
    name,
    price,
    originalPrice,
    images,
    vendorId,
    ratings,
    stock,
    badge,
  } = product

  const discount = getDiscount(price, originalPrice)
  const imageUrl = Array.isArray(images) && images.length > 0 ? images[0] : ''
  const outOfStock = stock === 0

  async function handleAdd(e) {
    e.stopPropagation()
    if (outOfStock || isAdding) return
    setIsAdding(true)
    try {
      await Promise.resolve(onAddToCart?.(product))
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 1500)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <article className="product-card" onClick={() => navigate(`/products/${_id}`)}>
      <div className="product-card-media">
        {imageUrl ? (
          <img src={imageUrl} alt={name} loading="lazy" />
        ) : (
          <span className="product-card-fallback" role="img" aria-label="product">
            📦
          </span>
        )}
        {badge ? <span className="product-card-badge">{badge}</span> : null}
        {outOfStock ? <span className="product-card-stock">Out of Stock</span> : null}
      </div>

      <div className="product-card-body">
        <span className="product-card-vendor">{vendorId?.shopName || 'Marketplace Vendor'}</span>
        <h3 className="product-card-name line-clamp-2">{name}</h3>

        <div className="product-card-price-row">
          <span className="product-card-price">{toCurrency(price)}</span>
          {originalPrice ? (
            <span className="product-card-original">{toCurrency(originalPrice)}</span>
          ) : null}
          {discount > 0 ? <span className="product-card-discount">{discount}% OFF</span> : null}
        </div>

        <div className="product-card-rating">
          <span className="product-card-stars">{getStars(ratings?.average)}</span>
          <span>({ratings?.count || 0})</span>
        </div>

        <button
          type="button"
          className="product-card-add-btn"
          disabled={outOfStock || isAdding}
          onClick={handleAdd}
        >
          {isAdding ? 'Adding...' : justAdded ? '✓ Added' : 'Add to Cart'}
        </button>
      </div>
    </article>
  )
}
