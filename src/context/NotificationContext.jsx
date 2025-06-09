import { createContext, useState, useCallback } from 'react'

export const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null)

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type })
    
    // Auto-dismiss notification after 5 seconds
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }, [])

  const hideNotification = useCallback(() => {
    setNotification(null)
  }, [])

  const value = {
    notification,
    showNotification,
    hideNotification
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}