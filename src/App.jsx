import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import Layout from './components/layout/Layout'
import VendorLayout from './components/layout/VendorLayout'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'

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
            <Route path="products/:id" element={<PagePlaceholder title="Product Details" />} />
            <Route path="vendors" element={<PagePlaceholder title="Vendors" />} />
            <Route path="cart" element={<PagePlaceholder title="Cart" />} />
            <Route path="login" element={<PagePlaceholder title="Login" />} />
            <Route path="register" element={<PagePlaceholder title="Register" />} />
            <Route path="dashboard" element={<PagePlaceholder title="Dashboard" />} />
            <Route path="register/vendor" element={<PagePlaceholder title="Become a vendor" />} />
            <Route path="help/vendors" element={<PagePlaceholder title="Vendor help" />} />
          </Route>

          <Route path="vendor" element={<VendorLayout />}>
            <Route index element={<PagePlaceholder title="Vendor dashboard" />} />
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
