import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useNotification } from '../../hooks/useNotification'
import './Notification.css'

const Notification = () => {
  const { notification, hideNotification } = useNotification()
  
  useEffect(() => {
    if (notification) {
      // Auto-hide notification after 5 seconds
      const timer = setTimeout(() => {
        hideNotification()
      }, 5000)
      
      // Clean up the timer
      return () => clearTimeout(timer)
    }
  }, [notification, hideNotification])
  
  if (!notification) return null
  
  return (
    <div className={`notification notification-${notification.type}`}>
      <p>{notification.message}</p>
      <button 
        className="notification-close" 
        onClick={hideNotification}
        aria-label="Cerrar notificación"
      >
        <X size={18} />
      </button>
    </div>
  )
}

export default Notification