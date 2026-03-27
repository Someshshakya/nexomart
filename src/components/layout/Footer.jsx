import { Link } from 'react-router-dom'
import './layout.css'

function SocialX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function SocialGitHub() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  )
}

function SocialMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16v12H4V6Zm0 0 8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="layout-footer">
      <div className="layout-footer-inner">
        <div className="layout-footer-grid">
          <div className="layout-footer-col">
            <h3>About freefree.in</h3>
            <p>
              freefree.in connects shoppers with trusted vendors. Discover products, compare
              sellers, and shop with confidence on our multi-vendor marketplace.
            </p>
          </div>
          <div className="layout-footer-col">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/products">Products</Link>
              </li>
              <li>
                <Link to="/vendors">Vendors</Link>
              </li>
              <li>
                <Link to="/cart">Cart</Link>
              </li>
            </ul>
          </div>
          <div className="layout-footer-col">
            <h3>Vendor Info</h3>
            <ul>
              <li>
                <Link to="/vendor">Vendor dashboard</Link>
              </li>
              <li>
                <Link to="/register/vendor">Become a vendor</Link>
              </li>
              <li>
                <Link to="/help/vendors">Vendor help</Link>
              </li>
            </ul>
          </div>
          <div className="layout-footer-col">
            <h3>Contact</h3>
            <p>support@freefree.in</p>
            <p>Mon–Sat, 9am–6pm IST</p>
          </div>
        </div>
      </div>
      <div className="layout-footer-bottom">
        <p className="layout-footer-copy">© {year} freefree.in. All rights reserved.</p>
        <div className="layout-footer-social">
          <a href="https://twitter.com" target="_blank" rel="noreferrer noopener" aria-label="X">
            <SocialX />
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer noopener" aria-label="GitHub">
            <SocialGitHub />
          </a>
          <a href="mailto:support@freefree.in" aria-label="Email">
            <SocialMail />
          </a>
        </div>
      </div>
    </footer>
  )
}
