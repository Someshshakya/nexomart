import './ui.css'

export default function Select({
  label,
  error,
  register,
  name,
  className = '',
  children,
  ...rest
}) {
  const registerProps = register && name ? register(name) : {}
  return (
    <div className={`ui-field ${className}`.trim()}>
      {label ? <label className="ui-label">{label}</label> : null}
      <select className="ui-select" {...registerProps} {...rest}>
        {children}
      </select>
      {error ? <span className="ui-error">{String(error.message || error)}</span> : null}
    </div>
  )
}
