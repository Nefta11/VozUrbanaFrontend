import { useEffect } from 'react'
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
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={32} />
      case 'error':
        return <AlertCircle size={32} />
      case 'success':
        return <CheckCircle size={32} />
      default:
        return <Info size={32} />
    }
  }

  const modalContent = (
    <div className="alert-modal-overlay" onClick={onClose}>
      <div className="alert-modal" onClick={e => e.stopPropagation()}>
        <div className={`alert-modal-icon ${type}`}>
          {getIcon()}
        </div>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="alert-modal-actions">
          {primaryAction && (
            <button
              className="alert-modal-button primary"
              onClick={primaryAction.onClick}
            >
              {primaryAction.icon}
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              className="alert-modal-button secondary"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.icon}
              {secondaryAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(
    modalContent,
    document.body
  )
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

export default AlertModal