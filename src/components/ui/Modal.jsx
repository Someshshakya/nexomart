import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import './ui.css'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) {
  useEffect(() => {
    if (!isOpen) return undefined
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="ui-modal-root" role="dialog" aria-modal="true" aria-label={title || 'Modal'}>
      <button
        type="button"
        className="ui-modal-backdrop"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className={`ui-modal-panel ui-modal-${size}`}>
        <div className="ui-modal-head">
          <strong>{title}</strong>
          <button type="button" className="ui-toast-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="ui-modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
