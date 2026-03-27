import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import './layout.css'

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM3 4h2l2.68 12.39a2 2 0 0 0 2 1.61h8.72a2 2 0 0 0 2-1.61L21 8H7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      className="layout-navbar-search-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm9 2-4.35-4.35"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg
      className="layout-navbar-chevron"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Navbar() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + (i.quantity ?? 1), 0),
  )

  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const userWrapRef = useRef(null)

  useEffect(() => {
    function handlePointerDown(e) {
      if (!userWrapRef.current?.contains(e.target)) {
        setUserOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  function handleSearchSubmit(e) {
    e.preventDefault()
    const q = query.trim()
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    navigate({ pathname: '/products', search: params.toString() ? `?${params}` : '' })
    setMobileOpen(false)
  }

  function handleLogout() {
    logout()
    setUserOpen(false)
    setMobileOpen(false)
  }

  return (
    <header className="layout-navbar">
      <div className="layout-navbar-inner">
        <button
          type="button"
          className="layout-navbar-hamburger"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-drawer"
          onClick={() => setMobileOpen((o) => !o)}
        >
          <MenuIcon />
        </button>

        <Link to="/" className="layout-navbar-brand">
          freefree.in
        </Link>

        <div className="layout-navbar-center">
          <nav className="layout-navbar-links" aria-label="Primary">
            <Link to="/" className="layout-navbar-link">
              Home
            </Link>
            <Link to="/products" className="layout-navbar-link">
              Products
            </Link>
            <Link to="/vendors" className="layout-navbar-link">
              Vendors
            </Link>
          </nav>

          <div className="layout-navbar-search-wrap">
            <form className="layout-navbar-search" onSubmit={handleSearchSubmit} role="search">
              <SearchIcon />
              <input
                type="search"
                name="q"
                placeholder="Search products…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search products"
              />
            </form>
          </div>
        </div>

        <div className="layout-navbar-right">
          <Link to="/cart" className="layout-navbar-cart" aria-label="Shopping cart">
            <CartIcon />
            {cartCount > 0 ? (
              <span className="layout-navbar-cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
            ) : null}
          </Link>

          {!user ? (
            <Link to="/login" className="layout-navbar-login">
              Login
            </Link>
          ) : (
            <div className="layout-navbar-user-wrap" ref={userWrapRef}>
              <button
                type="button"
                className="layout-navbar-user-trigger"
                aria-expanded={userOpen}
                aria-haspopup="true"
                onClick={() => setUserOpen((o) => !o)}
              >
                {user.name}
                <ChevronIcon />
              </button>
              {userOpen ? (
                <div className="layout-navbar-dropdown" role="menu">
                  <div className="layout-navbar-dropdown-name">{user.name}</div>
                  <span className="layout-navbar-dropdown-role">{user.role}</span>
                  <Link to="/dashboard" role="menuitem" onClick={() => setUserOpen(false)}>
                    Dashboard
                  </Link>
                  <button type="button" role="menuitem" onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div
        id="mobile-nav-drawer"
        className={`layout-navbar-mobile-panel${mobileOpen ? ' is-open' : ''}`}
        aria-hidden={!mobileOpen}
      >
        <div className="layout-navbar-mobile-inner">
          <Link
            to="/"
            className="layout-navbar-mobile-link"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/products"
            className="layout-navbar-mobile-link"
            onClick={() => setMobileOpen(false)}
          >
            Products
          </Link>
          <Link
            to="/vendors"
            className="layout-navbar-mobile-link"
            onClick={() => setMobileOpen(false)}
          >
            Vendors
          </Link>
          {!user ? (
            <div className="layout-navbar-mobile-user">
              <Link
                to="/login"
                className="layout-navbar-mobile-link"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="layout-navbar-mobile-user">
              <div className="layout-navbar-dropdown-name">{user.name}</div>
              <span className="layout-navbar-dropdown-role">{user.role}</span>
              <Link
                to="/dashboard"
                className="layout-navbar-mobile-link"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <button
                type="button"
                className="layout-navbar-mobile-link layout-navbar-mobile-logout"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
