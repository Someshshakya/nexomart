import './ui.css'

export default function Skeleton({
  width = '100%',
  height = '1rem',
  rounded = true,
  className = '',
}) {
  return (
    <div
      className={`ui-skeleton ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius: rounded ? '0.5rem' : '0',
      }}
      aria-hidden
    />
  )
}
