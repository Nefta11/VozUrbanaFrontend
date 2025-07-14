import { useEffect, memo, useCallback } from 'react'
import { X } from 'lucide-react'
import { useNotification } from '../../hooks/useNotification'
import './Notification.css'

// Configuración externa para evitar recreación en cada render
const NOTIFICATION_CONFIG = {
  autoHideTimeout: 5000, // 5 segundos
  iconSize: 18,
  closeButtonAriaLabel: 'Cerrar notificación'
}

// Función utilitaria para obtener el icono de cierre
const getCloseIcon = () => {
  return <X size={NOTIFICATION_CONFIG.iconSize} aria-hidden="true" />
}

// Componente optimizado de notificación
const Notification = memo(() => {
  const { notification, hideNotification } = useNotification()

  // Manejador optimizado para cerrar notificación
  const handleClose = useCallback(() => {
    hideNotification()
  }, [hideNotification])

  // Efecto para auto-ocultar la notificación
  useEffect(() => {
    if (notification) {
      // Auto-ocultar notificación después del tiempo configurado
      const timer = setTimeout(() => {
        hideNotification()
      }, NOTIFICATION_CONFIG.autoHideTimeout)

      // Limpiar el timer
      return () => clearTimeout(timer)
    }
  }, [notification, hideNotification])

  // No renderizar si no hay notificación
  if (!notification) return null

  return (
    <div
      className={`notification notification-${notification.type}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="notification-message">{notification.message}</p>
      <button
        className="notification-close"
        onClick={handleClose}
        aria-label={NOTIFICATION_CONFIG.closeButtonAriaLabel}
        type="button"
      >
        {getCloseIcon()}
      </button>
    </div>
  )
})

// Asignar nombre para el display name de React DevTools
Notification.displayName = 'Notification'

export default Notification