import Spinner from './Spinner'
import './ui.css'

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  children,
  ...rest
}) {
  const isDisabled = disabled || loading
  return (
    <button
      type="button"
      className={`ui-btn ui-btn-${variant} ui-btn-${size} ${className}`.trim()}
      disabled={isDisabled}
      onClick={onClick}
      {...rest}
    >
      {loading ? <Spinner size="sm" color={variant === 'primary' ? 'light' : 'brand'} /> : null}
      <span style={loading ? { opacity: 0.85 } : undefined}>{children}</span>
    </button>
  )
}
