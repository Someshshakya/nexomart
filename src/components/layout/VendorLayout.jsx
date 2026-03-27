import { NavLink, Outlet } from 'react-router-dom'
import './layout.css'

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const nav = [
  { to: '/vendor', end: true, label: 'Dashboard' },
  { to: '/vendor/products', label: 'Products' },
  { to: '/vendor/orders', label: 'Orders' },
  { to: '/vendor/earnings', label: 'Earnings' },
  { to: '/vendor/settings', label: 'Settings' },
]

/**
 * @param {{ vendorName?: string }} props
 */
export default function VendorLayout({ vendorName = 'Your store' }) {
  return (
    <div className="layout-dashboard">
      <aside className="layout-dashboard-sidebar" aria-label="Vendor navigation">
        <div className="layout-dashboard-sidebar-brand">Vendor</div>
        <nav className="layout-dashboard-sidebar-nav">
          {nav.map(({ to, end, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `layout-dashboard-nav-item${isActive ? ' is-active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="layout-dashboard-main">
        <header className="layout-dashboard-topbar">
          <h1 className="layout-dashboard-title">{vendorName}</h1>
          <button type="button" className="layout-dashboard-bell" aria-label="Notifications">
            <BellIcon />
          </button>
        </header>
        <div className="layout-dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
