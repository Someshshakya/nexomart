import './ui.css'

export default function Input({
  label,
  error,
  placeholder,
  type = 'text',
  register,
  name,
  className = '',
  ...rest
}) {
  const registerProps = register && name ? register(name) : {}
  return (
    <div className={`ui-field ${className}`.trim()}>
      {label ? <label className="ui-label">{label}</label> : null}
      <input
        type={type}
        placeholder={placeholder}
        className="ui-input"
        {...registerProps}
        {...rest}
      />
      {error ? <span className="ui-error">{String(error.message || error)}</span> : null}
    </div>
  )
}
