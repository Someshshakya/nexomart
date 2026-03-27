import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import VendorLayout from './components/layout/VendorLayout'
import CustomerDashboard from './pages/CustomerDashboard'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import RegisterPage from './pages/RegisterPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'

function PagePlaceholder({ title }) {
  return (
    <div style={{ padding: '2rem 0', textAlign: 'left' }}>
      <h1
        style={{
          fontFamily: 'var(--heading)',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--color-text)',
          margin: '0 0 0.5rem',
        }}
      >
        {title}
      </h1>
      <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Page placeholder</p>
    </div>
  )
}

export default function App() {
  return (
    <div className="app-shell">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="vendors" element={<PagePlaceholder title="Vendors" />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute role="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="register/vendor" element={<PagePlaceholder title="Become a vendor" />} />
            <Route path="help/vendors" element={<PagePlaceholder title="Vendor help" />} />
            <Route path="orders/:id" element={<PagePlaceholder title="Order Tracking" />} />
          </Route>

          <Route path="vendor" element={<VendorLayout />}>
            <Route index element={<PagePlaceholder title="Vendor dashboard" />} />
            <Route path="dashboard" element={<PagePlaceholder title="Vendor dashboard" />} />
            <Route path="products" element={<PagePlaceholder title="Vendor products" />} />
            <Route path="orders" element={<PagePlaceholder title="Vendor orders" />} />
            <Route path="earnings" element={<PagePlaceholder title="Earnings" />} />
            <Route path="settings" element={<PagePlaceholder title="Vendor settings" />} />
          </Route>

          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<PagePlaceholder title="Admin dashboard" />} />
            <Route path="products" element={<PagePlaceholder title="Admin products" />} />
            <Route path="orders" element={<PagePlaceholder title="Admin orders" />} />
            <Route path="earnings" element={<PagePlaceholder title="Admin earnings" />} />
            <Route path="settings" element={<PagePlaceholder title="Admin settings" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}
