import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, Info, AlertTriangle, CheckCircle } from 'lucide-react'
import PropTypes from 'prop-types'
import './AlertModal.css'

const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  primaryAction,
  secondaryAction
}) => {
  // Manejo de la tecla ESC
  const handleEscKey = useCallback((event) => {
    if (event.key === 'Escape' && isOpen) {
      onClose()
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEscKey)
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen, handleEscKey])

  if (!isOpen) return null

  // Objeto de configuración de iconos 
  const iconConfig = {
    warning: AlertTriangle,
    error: AlertCircle,
    success: CheckCircle,
    info: Info
  }

  const IconComponent = iconConfig[type] || iconConfig.info

  const modalContent = (
    <div
      className="alert-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
      aria-describedby="alert-modal-description"
    >
      <div
        className="alert-modal"
        onClick={e => e.stopPropagation()}
        role="document"
      >
        <div className={`alert-modal-icon ${type}`} aria-hidden="true">
          <IconComponent size={32} />
        </div>

        {title && (
          <h2 id="alert-modal-title">{title}</h2>
        )}

        {message && (
          <p id="alert-modal-description">{message}</p>
        )}

        <div className="alert-modal-actions">
          {primaryAction && (
            <button
              className="alert-modal-button primary"
              onClick={primaryAction.onClick}
              autoFocus
              type="button"
            >
              {primaryAction.icon}
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              className="alert-modal-button secondary"
              onClick={secondaryAction.onClick}
              type="button"
            >
              {secondaryAction.icon}
              {secondaryAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
AlertModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  type: PropTypes.oneOf(['info', 'warning', 'error', 'success']),
  primaryAction: PropTypes.shape({
    onClick: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.node
  }),
  secondaryAction: PropTypes.shape({
    onClick: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.node
  })
}

AlertModal.defaultProps = {
  type: 'info',
  title: null,
  message: null,
  primaryAction: null,
  secondaryAction: null
}

export default AlertModal