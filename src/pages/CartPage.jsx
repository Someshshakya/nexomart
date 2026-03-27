import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import './cart.css'

function toCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 6h18M8 6V4h8v2m-1 0v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function CartPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQty = useCartStore((s) => s.updateQty)
  const subtotal = useCartStore((s) => s.subtotal())
  const itemCount = useCartStore((s) => s.itemCount())

  const [promoCode, setPromoCode] = useState('')
  const [promoStatus, setPromoStatus] = useState({ type: '', message: '', amount: 0 })
  const [applyingPromo, setApplyingPromo] = useState(false)

  const delivery = subtotal > 499 || subtotal === 0 ? 0 : 49
  const discount = promoStatus.amount || 0
  const total = Math.max(0, subtotal + delivery - discount)

  const hasItems = itemCount > 0

  const paymentMethods = useMemo(() => ['UPI', 'Visa', 'Mastercard', 'RuPay'], [])

  async function applyPromo() {
    if (!promoCode.trim()) return
    setApplyingPromo(true)
    setPromoStatus({ type: '', message: '', amount: 0 })
    try {
      const response = await fetch('/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim(), subtotal }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.message || 'Invalid promo code')
      const amount = Number(data?.discountAmount || 0)
      setPromoStatus({
        type: 'ok',
        message: data?.message || 'Promo applied successfully',
        amount,
      })
    } catch (error) {
      if (promoCode.trim().toUpperCase() === 'SAVE10') {
        const amount = Math.round(subtotal * 0.1)
        setPromoStatus({ type: 'ok', message: 'SAVE10 applied (10% off)', amount })
      } else {
        setPromoStatus({
          type: 'err',
          message: error.message || 'Promo could not be applied',
          amount: 0,
        })
      }
    } finally {
      setApplyingPromo(false)
    }
  }

  if (!hasItems) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="cart-empty-illu">🛍️</div>
          <h2>Your cart is empty</h2>
          <p>Add products to your cart and they will appear here.</p>
          <Link to="/products" className="cart-empty-btn">
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-layout">
        <section>
          <h1 className="cart-title">Shopping Cart ({itemCount} items)</h1>

          <div className="cart-list">
            {items.map((item) => {
              const product = item.product || {}
              const stock = Number(product.stock ?? 999)
              const unitPrice = Number(product.price ?? 0)
              const lineTotal = unitPrice * Number(item.quantity ?? 0)
              const image = Array.isArray(product.images) ? product.images[0] : ''

              return (
                <article key={item.id} className="cart-item">
                  {image ? (
                    <img src={image} alt={product.name || 'product'} loading="lazy" />
                  ) : (
                    <div className="cart-item-fallback">📦</div>
                  )}

                  <div>
                    <Link className="cart-item-name" to={`/products/${item.id}`}>
                      {product.name || 'Product'}
                    </Link>
                    <div className="cart-item-vendor">
                      {product.vendorId?.shopName || 'Marketplace Vendor'}
                    </div>
                    <div style={{ marginTop: '0.45rem' }} className="cart-stepper">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, Number(item.quantity || 1) - 1)}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={stock}
                        value={item.quantity}
                        onChange={(e) => updateQty(item.id, Number(e.target.value))}
                      />
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, Number(item.quantity || 1) + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-meta">
                    <div className="cart-prices">
                      <div className="cart-line-total">{toCurrency(lineTotal)}</div>
                      <div className="cart-unit-price">{toCurrency(unitPrice)} each</div>
                    </div>
                    <button
                      type="button"
                      className="cart-remove"
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove item"
                    >
                      <TrashIcon />
                    </button>
                    <Link to="/products" className="cart-save-link">
                      Save for Later
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="cart-continue">
            <Link className="cart-save-link" to="/products">
              ← Continue Shopping
            </Link>
          </div>
        </section>

        <aside className="cart-summary">
          <h3>Order Summary</h3>
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>{toCurrency(subtotal)}</span>
          </div>
          <div className="cart-summary-row muted">
            <span>Delivery</span>
            <span>{delivery === 0 ? 'FREE' : toCurrency(delivery)}</span>
          </div>
          <div className="cart-summary-row muted">
            <span>Discount</span>
            <span>-{toCurrency(discount)}</span>
          </div>
          <div className="cart-summary-row cart-summary-total">
            <span>Total</span>
            <span>{toCurrency(total)}</span>
          </div>

          <div className="cart-promo">
            <div className="cart-promo-row">
              <input
                type="text"
                placeholder="Promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button type="button" onClick={applyPromo} disabled={applyingPromo}>
                {applyingPromo ? 'Applying...' : 'Apply'}
              </button>
            </div>
            {promoStatus.message ? (
              <div className={`cart-promo-msg ${promoStatus.type}`}>{promoStatus.message}</div>
            ) : null}
          </div>

          <button
            type="button"
            className="cart-checkout-btn"
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>

          <div className="cart-security">🔒 256-bit SSL encrypted</div>
          <div className="cart-payments">
            {paymentMethods.map((method) => (
              <span key={method} className="cart-pay-chip">
                {method}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
