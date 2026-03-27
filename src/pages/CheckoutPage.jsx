import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Link, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { createOrder } from '../services/orders'
import './checkout.css'

const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().regex(/^[0-9]{10,15}$/, 'Enter a valid phone number'),
  address1: z.string().min(1, 'Address Line 1 is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^[0-9]{5,8}$/, 'Enter a valid pincode'),
})

function toCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`
}

function fetchAddresses() {
  return fetch('/users/addresses')
    .then((r) => {
      if (!r.ok) throw new Error('Failed to fetch addresses')
      return r.json()
    })
    .then((data) => (Array.isArray(data) ? data : data?.addresses || []))
    .catch(() => [])
}

function mapAddress(addr) {
  return {
    firstName: addr.firstName || '',
    lastName: addr.lastName || '',
    phone: addr.phone || '',
    address1: addr.address1 || '',
    address2: addr.address2 || '',
    city: addr.city || '',
    state: addr.state || '',
    pincode: addr.pincode || '',
  }
}

export default function CheckoutPage() {
  const user = useAuthStore((s) => s.user)
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const subtotal = useCartStore((s) => s.subtotal())

  const [step, setStep] = useState(1)
  const [useSavedAddress, setUseSavedAddress] = useState(true)
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' })
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderResult, setOrderResult] = useState(null)
  const [paymentError, setPaymentError] = useState('')

  const { data: savedAddresses = [] } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: fetchAddresses,
    enabled: Boolean(user),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      pincode: '',
    },
  })

  const delivery = subtotal > 499 || subtotal === 0 ? 0 : 49
  const totalAmount = subtotal + delivery
  const walletBalance = Number(user?.wallet ?? 0)

  const steps = useMemo(
    () => [
      { id: 1, label: 'Address' },
      { id: 2, label: 'Payment' },
      { id: 3, label: 'Confirm' },
    ],
    [],
  )

  if (!user) return <Navigate to="/login" replace />

  function onAddressSubmit(values) {
    if (useSavedAddress && selectedAddressId) {
      const saved = savedAddresses.find((a) => String(a.id ?? a._id) === selectedAddressId)
      if (saved) {
        setDeliveryAddress(mapAddress(saved))
        setStep(2)
        return
      }
    }
    setDeliveryAddress(values)
    setStep(2)
  }

  async function handlePlaceOrder() {
    setPaymentError('')
    if (paymentMethod === 'card') {
      if (!card.number || !card.expiry || !card.cvv) {
        setPaymentError('Please fill complete card details')
        return
      }
    }
    if (!deliveryAddress) {
      setPaymentError('Please complete address step first')
      setStep(1)
      return
    }
    setPlacingOrder(true)
    try {
      const order = await createOrder({
        items,
        deliveryAddress,
        paymentMethod,
        totalAmount,
      })
      setOrderResult(order)
      clearCart()
      setStep(3)
    } catch (error) {
      setPaymentError(error.message || 'Order could not be placed')
    } finally {
      setPlacingOrder(false)
    }
  }

  return (
    <div className="checkout-page">
      <div className="checkout-layout">
        <section>
          <div className="checkout-stepper">
            {steps.map((s) => {
              const state = step > s.id ? 'done' : step === s.id ? 'active' : 'future'
              return (
                <div key={s.id} className={`checkout-step ${state}`}>
                  <span className="checkout-step-marker">{step > s.id ? '✓' : s.id}</span>
                  <strong>{s.label}</strong>
                </div>
              )
            })}
          </div>

          {step === 1 ? (
            <form className="checkout-card" onSubmit={handleSubmit(onAddressSubmit)}>
              <h2>Delivery Address</h2>

              {savedAddresses.length > 0 ? (
                <div className="checkout-address-saved">
                  <label style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={useSavedAddress}
                      onChange={(e) => setUseSavedAddress(e.target.checked)}
                    />
                    Use saved address
                  </label>
                  {useSavedAddress
                    ? savedAddresses.map((addr) => {
                        const id = String(addr.id ?? addr._id)
                        return (
                          <label className="checkout-address-option" key={id}>
                            <input
                              type="radio"
                              checked={selectedAddressId === id}
                              onChange={() => setSelectedAddressId(id)}
                            />
                            <span>
                              <strong>{addr.firstName} {addr.lastName}</strong>
                              <br />
                              {addr.address1}, {addr.city}
                            </span>
                          </label>
                        )
                      })
                    : null}
                </div>
              ) : null}

              {!useSavedAddress || savedAddresses.length === 0 ? (
                <div className="checkout-grid two">
                  <div className="checkout-field">
                    <label>First Name</label>
                    <input {...register('firstName')} />
                    {errors.firstName ? <span className="checkout-error">{errors.firstName.message}</span> : null}
                  </div>
                  <div className="checkout-field">
                    <label>Last Name</label>
                    <input {...register('lastName')} />
                    {errors.lastName ? <span className="checkout-error">{errors.lastName.message}</span> : null}
                  </div>
                  <div className="checkout-field">
                    <label>Phone</label>
                    <input {...register('phone')} />
                    {errors.phone ? <span className="checkout-error">{errors.phone.message}</span> : null}
                  </div>
                  <div className="checkout-field">
                    <label>Address Line 1</label>
                    <input {...register('address1')} />
                    {errors.address1 ? <span className="checkout-error">{errors.address1.message}</span> : null}
                  </div>
                  <div className="checkout-field" style={{ gridColumn: '1 / -1' }}>
                    <label>Address Line 2</label>
                    <input {...register('address2')} />
                  </div>
                  <div className="checkout-field">
                    <label>City</label>
                    <input {...register('city')} />
                    {errors.city ? <span className="checkout-error">{errors.city.message}</span> : null}
                  </div>
                  <div className="checkout-field">
                    <label>State</label>
                    <input {...register('state')} />
                    {errors.state ? <span className="checkout-error">{errors.state.message}</span> : null}
                  </div>
                  <div className="checkout-field">
                    <label>Pincode</label>
                    <input {...register('pincode')} />
                    {errors.pincode ? <span className="checkout-error">{errors.pincode.message}</span> : null}
                  </div>
                </div>
              ) : null}

              <div className="checkout-actions">
                <button type="submit" className="checkout-btn">
                  Continue to Payment
                </button>
              </div>
            </form>
          ) : null}

          {step === 2 ? (
            <div className="checkout-card">
              <h2>Payment Method</h2>
              <p className="checkout-total-strong">Order Total: {toCurrency(totalAmount)}</p>

              <div className="checkout-pay-grid">
                {[
                  { id: 'upi', label: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
                  { id: 'card', label: 'Credit / Debit Card', desc: 'Pay using card details' },
                  { id: 'wallet', label: 'Freefree Wallet', desc: `Balance: ${toCurrency(walletBalance)}` },
                  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when order arrives' },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`checkout-pay-card${paymentMethod === method.id ? ' active' : ''}`}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                    />
                    <span>
                      <strong>{method.label}</strong>
                      <br />
                      <small>{method.desc}</small>
                    </span>
                  </label>
                ))}
              </div>

              {paymentMethod === 'card' ? (
                <div className="checkout-grid two" style={{ marginTop: '0.7rem' }}>
                  <div className="checkout-field" style={{ gridColumn: '1 / -1' }}>
                    <label>Card Number</label>
                    <input
                      value={card.number}
                      onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))}
                    />
                  </div>
                  <div className="checkout-field">
                    <label>Expiry</label>
                    <input
                      placeholder="MM/YY"
                      value={card.expiry}
                      onChange={(e) => setCard((c) => ({ ...c, expiry: e.target.value }))}
                    />
                  </div>
                  <div className="checkout-field">
                    <label>CVV</label>
                    <input
                      value={card.cvv}
                      onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value }))}
                    />
                  </div>
                </div>
              ) : null}

              {paymentError ? <p className="checkout-error">{paymentError}</p> : null}

              <div className="checkout-actions">
                <button type="button" className="checkout-btn" onClick={handlePlaceOrder} disabled={placingOrder}>
                  {placingOrder ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="checkout-card checkout-success">
              <div className="checkout-confetti">🎉 🎊 ✨</div>
              <h2>Order Confirmed!</h2>
              <p>Order ID: <strong>{orderResult?.id || orderResult?._id || 'N/A'}</strong></p>
              <p>Estimated delivery: {orderResult?.estimatedDelivery || '3-5 business days'}</p>
              <div className="checkout-success-actions">
                <Link
                  className="checkout-link-btn primary"
                  to={`/orders/${orderResult?.id || orderResult?._id || 'latest'}`}
                >
                  Track Order
                </Link>
                <Link className="checkout-link-btn" to="/products">
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="checkout-summary">
          <h3>Order Summary</h3>
          {items.length === 0 ? <p>Your cart is empty.</p> : null}
          {items.map((item) => (
            <div className="checkout-summary-item" key={item.id}>
              <span>{item.product?.name || 'Product'} x {item.quantity}</span>
              <strong>{toCurrency(Number(item.product?.price || 0) * Number(item.quantity || 0))}</strong>
            </div>
          ))}
          <div className="checkout-summary-item">
            <span>Subtotal</span>
            <span>{toCurrency(subtotal)}</span>
          </div>
          <div className="checkout-summary-item">
            <span>Delivery</span>
            <span>{delivery === 0 ? 'FREE' : toCurrency(delivery)}</span>
          </div>
          <div className="checkout-summary-item checkout-summary-total">
            <span>Total</span>
            <span>{toCurrency(totalAmount)}</span>
          </div>
        </aside>
      </div>
    </div>
  )
}
