import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { authAPI } from '../services/authAPI'

export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  
  // Add isAdmin check to the returned context
  return {
    ...context,
    isAdmin: authAPI.isAdmin(context.user)
  }
}