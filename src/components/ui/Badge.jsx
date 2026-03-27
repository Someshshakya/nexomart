import './ui.css'

export default function Badge({ variant = 'gray', size = 'md', children, className = '' }) {
  return (
    <span className={`ui-badge ui-badge-${variant} ui-badge-${size} ${className}`.trim()}>
      {children}
    </span>
  )
}
