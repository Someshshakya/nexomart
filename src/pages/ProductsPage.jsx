import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/products/ProductCard'
import ProductCardSkeleton from '../components/products/ProductCardSkeleton'
import { getProducts } from '../services/products'
import { useCartStore } from '../store/cartStore'
import './products.css'

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home',
  'Sports',
  'Books',
  'Beauty',
  'Grocery',
  'Toys',
]

const SORTS = [
  { value: 'popular', label: 'Popular' },
  { value: 'priceAsc', label: 'Price ↑' },
  { value: 'priceDesc', label: 'Price ↓' },
  { value: 'ratingDesc', label: 'Highest Rated' },
]

const PAGE_SIZE = 9

function parseNum(value, fallback) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const selectedCategories = (searchParams.get('category') || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
  const minPrice = Math.max(0, parseNum(searchParams.get('minPrice'), 0))
  const maxPrice = Math.max(minPrice, parseNum(searchParams.get('maxPrice'), 10000))
  const rating = searchParams.get('rating') || 'any'
  const sort = searchParams.get('sort') || 'popular'
  const page = Math.max(1, parseNum(searchParams.get('page'), 1))
  const q = (searchParams.get('q') || '').trim()

  const filters = useMemo(
    () => ({
      category: selectedCategories.join(','),
      minPrice,
      maxPrice,
      rating,
      sort,
      page,
      q,
      limit: PAGE_SIZE,
    }),
    [selectedCategories, minPrice, maxPrice, rating, sort, page, q],
  )

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
    placeholderData: keepPreviousData,
  })

  const sourceProducts = Array.isArray(data) ? data : data?.products || []

  const filteredProducts = useMemo(() => {
    let list = [...sourceProducts]
    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category))
    }
    list = list.filter((p) => (p.price ?? 0) >= minPrice && (p.price ?? 0) <= maxPrice)
    if (rating === '4') list = list.filter((p) => (p.ratings?.average || 0) >= 4)
    if (rating === '3') list = list.filter((p) => (p.ratings?.average || 0) >= 3)
    if (q) {
      const needle = q.toLowerCase()
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(needle) ||
          p.vendorId?.shopName?.toLowerCase().includes(needle),
      )
    }
    if (sort === 'priceAsc') list.sort((a, b) => (a.price || 0) - (b.price || 0))
    if (sort === 'priceDesc') list.sort((a, b) => (b.price || 0) - (a.price || 0))
    if (sort === 'ratingDesc')
      list.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0))
    return list
  }, [sourceProducts, selectedCategories, minPrice, maxPrice, rating, q, sort])

  const totalProducts = filteredProducts.length
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pagedProducts = filteredProducts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  function updateParam(next) {
    const updated = new URLSearchParams(searchParams)
    Object.entries(next).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || value === 'any') {
        updated.delete(key)
      } else {
        updated.set(key, String(value))
      }
    })
    if (!('page' in next)) updated.set('page', '1')
    setSearchParams(updated)
  }

  function toggleCategory(category) {
    const set = new Set(selectedCategories)
    if (set.has(category)) set.delete(category)
    else set.add(category)
    updateParam({ category: [...set].join(','), page: 1 })
  }

  function clearFilters() {
    const updated = new URLSearchParams()
    if (q) updated.set('q', q)
    updated.set('page', '1')
    setSearchParams(updated)
    setDrawerOpen(false)
  }

  function renderFilters() {
    return (
      <div className="products-filter-card">
        <div className="products-filter-section">
          <h3 className="products-filter-title">Categories</h3>
          <div className="products-filter-options">
            {CATEGORIES.map((category) => (
              <label key={category}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                />
                {category}
              </label>
            ))}
          </div>
        </div>

        <div className="products-filter-section">
          <h3 className="products-filter-title">Price Range</h3>
          <div className="products-price-row">
            <input
              type="range"
              min="0"
              max="10000"
              value={minPrice}
              onChange={(e) =>
                updateParam({ minPrice: Math.min(Number(e.target.value), maxPrice), page: 1 })
              }
            />
            <input
              type="range"
              min="0"
              max="10000"
              value={maxPrice}
              onChange={(e) =>
                updateParam({ maxPrice: Math.max(Number(e.target.value), minPrice), page: 1 })
              }
            />
          </div>
          <div className="products-price-values">
            Rs {minPrice.toLocaleString('en-IN')} - Rs {maxPrice.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="products-filter-section">
          <h3 className="products-filter-title">Rating</h3>
          <div className="products-filter-options">
            <label>
              <input
                type="radio"
                name="rating"
                checked={rating === '4'}
                onChange={() => updateParam({ rating: '4', page: 1 })}
              />
              4★+
            </label>
            <label>
              <input
                type="radio"
                name="rating"
                checked={rating === '3'}
                onChange={() => updateParam({ rating: '3', page: 1 })}
              />
              3★+
            </label>
            <label>
              <input
                type="radio"
                name="rating"
                checked={rating === 'any'}
                onChange={() => updateParam({ rating: 'any', page: 1 })}
              />
              Any
            </label>
          </div>
        </div>

        <button type="button" className="products-clear-btn" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>
    )
  }

  return (
    <div className="products-page">
      <div className="products-layout">
        <aside className="products-sidebar">{renderFilters()}</aside>

        <section className="products-main">
          <div className="products-mobile-controls">
            <button
              type="button"
              className="products-filter-btn"
              onClick={() => setDrawerOpen(true)}
            >
              Filters
            </button>
          </div>

          <div className="products-topbar">
            <div className="products-count">
              Showing {totalProducts} products {isFetching ? '(updating...)' : ''}
            </div>
            <div className="products-sort-wrap">
              <label htmlFor="sort">Sort:</label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => updateParam({ sort: e.target.value, page: 1 })}
              >
                {SORTS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="products-grid">
            {isLoading
              ? Array.from({ length: 6 }).map((_, idx) => <ProductCardSkeleton key={idx} />)
              : pagedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} onAddToCart={addItem} />
                ))}
          </div>

          {!isLoading && pagedProducts.length === 0 ? (
            <div className="products-empty">
              <div className="products-empty-illu">🧺</div>
              <h3>No products found</h3>
              <p>Try changing filters or clearing them to see more results.</p>
            </div>
          ) : null}

          {!isLoading && totalPages > 1 ? (
            <div className="products-pagination">
              <button
                type="button"
                className="products-page-btn"
                disabled={safePage <= 1}
                onClick={() => updateParam({ page: safePage - 1 })}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pg = idx + 1
                return (
                  <button
                    key={pg}
                    type="button"
                    className={`products-page-btn${pg === safePage ? ' active' : ''}`}
                    onClick={() => updateParam({ page: pg })}
                  >
                    {pg}
                  </button>
                )
              })}
              <button
                type="button"
                className="products-page-btn"
                disabled={safePage >= totalPages}
                onClick={() => updateParam({ page: safePage + 1 })}
              >
                Next
              </button>
            </div>
          ) : null}
        </section>
      </div>

      {drawerOpen ? (
        <>
          <button
            type="button"
            className="products-drawer-backdrop"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close filters"
          />
          <div className="products-drawer">
            <div className="products-drawer-head">
              <strong>Filters</strong>
              <button
                type="button"
                className="products-clear-btn"
                onClick={() => setDrawerOpen(false)}
              >
                Close
              </button>
            </div>
            {renderFilters()}
          </div>
        </>
      ) : null}
    </div>
  )
}
