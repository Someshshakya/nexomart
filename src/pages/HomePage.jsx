import { Link } from 'react-router-dom'
import ProductCard from '../components/products/ProductCard'
import ProductCardSkeleton from '../components/products/ProductCardSkeleton'
import { useFeaturedProducts } from '../hooks/useFeaturedProducts'
import { useCartStore } from '../store/cartStore'
import './home.css'

const categories = [
  { name: 'Electronics', icon: '📱' },
  { name: 'Fashion', icon: '👗' },
  { name: 'Home & Garden', icon: '🏡' },
  { name: 'Books', icon: '📚' },
  { name: 'Sports', icon: '🏏' },
  { name: 'Grocery', icon: '🛒' },
  { name: 'Beauty', icon: '💄' },
  { name: 'Toys', icon: '🧸' },
]

export default function HomePage() {
  const { data: featured = [], isLoading } = useFeaturedProducts()
  const addItem = useCartStore((s) => s.addItem)

  return (
    <div className="home-page">
      <section className="home-hero">
        <h1>Shop. Earn. Grow Together.</h1>
        <p>
          Discover quality products and unlock MLM referral commissions while you
          shop, refer, and grow with freefree.in.
        </p>
        <div className="home-hero-ctas">
          <Link to="/products" className="home-btn primary">
            Shop Now
          </Link>
          <Link to="/register?role=vendor" className="home-btn secondary">
            Become a Vendor
          </Link>
        </div>
        <div className="home-hero-stats">
          <div className="home-stat">
            <strong>10K+</strong>
            <span>Products</span>
          </div>
          <div className="home-stat">
            <strong>500+</strong>
            <span>Vendors</span>
          </div>
          <div className="home-stat">
            <strong>50K+</strong>
            <span>Buyers</span>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-head">
          <h2 className="home-section-title">Browse Categories</h2>
        </div>
        <div className="home-category-row">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="home-category-card"
            >
              <span>{category.icon}</span>
              <small>{category.name}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-head">
          <h2 className="home-section-title">Featured Products</h2>
          <Link to="/products" className="home-link">
            View All
          </Link>
        </div>
        <div className="home-products-grid">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.map((product) => (
                <ProductCard key={product._id} product={product} onAddToCart={addItem} />
              ))}
        </div>
      </section>

      <section className="home-section home-mlm">
        <div>
          <h2 className="home-section-title">MLM Commission System</h2>
          <p>
            Earn from a 5-level referral tree. Invite buyers and vendors, then
            grow recurring rewards on every qualifying purchase.
          </p>
        </div>
        <div className="home-mlm-levels">
          <div className="home-mlm-level"><span>L1</span><strong>10%</strong></div>
          <div className="home-mlm-level"><span>L2</span><strong>5%</strong></div>
          <div className="home-mlm-level"><span>L3</span><strong>3%</strong></div>
          <div className="home-mlm-level"><span>L4</span><strong>2%</strong></div>
        </div>
        <div>
          <Link to="/register" className="home-btn primary">
            Join &amp; Earn
          </Link>
        </div>
      </section>

      <section className="home-trust">
        <div className="home-trust-item">🚚 Free Delivery</div>
        <div className="home-trust-item">↩️ Easy Returns</div>
        <div className="home-trust-item">🔒 Secure Payment</div>
        <div className="home-trust-item">🕒 24/7 Support</div>
      </section>
    </div>
  )
}
