import './productCard.css'

export default function ProductCardSkeleton() {
  return (
    <article className="product-card-skeleton animate-pulse" aria-hidden>
      <div className="product-card-skeleton-media" />
      <div className="product-card-skeleton-body">
        <div className="skeleton-line short" />
        <div className="skeleton-line full" />
        <div className="skeleton-line medium" />
        <div className="skeleton-line short" />
        <div className="skeleton-line full" />
      </div>
    </article>
  )
}
