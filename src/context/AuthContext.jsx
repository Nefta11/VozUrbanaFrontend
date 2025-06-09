import { createContext, useState, useCallback, useEffect } from 'react'
import { authAPI } from '../services/authAPI'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const login = useCallback(async (email, password) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const userData = await authAPI.login(email, password)
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(userData))
      return userData
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (userData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const newUser = await authAPI.register(userData)
      setUser(newUser)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(newUser))
      return newUser
    } catch (err) {
      setError(err.message || 'Error al registrarse')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
  }, [])

  const checkAuth = useCallback(() => {
    setIsLoading(true)
    
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (err) {
        localStorage.removeItem('user')
        setError('Sesión inválida')
      }
    }
    
    setIsLoading(false)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}