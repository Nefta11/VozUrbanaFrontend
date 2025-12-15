import { createContext, useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { authAPI } from '../services/authAPI'
import { setAuthLogoutHandler } from '../config/api'
import indexedDBService from '../services/indexedDBService'

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

      // Guardar en localStorage (rápido)
      localStorage.setItem('user', JSON.stringify(userData))

      // Guardar también en IndexedDB (persistencia robusta)
      try {
        await indexedDBService.setMetadata('user', userData)
        await indexedDBService.setMetadata('lastLoginTime', Date.now())
      } catch (dbErr) {
        console.warn('Error guardando en IndexedDB:', dbErr)
      }

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
      // Solo llamar al API, no autenticar automáticamente
      await authAPI.register(userData)
      return { success: true }
    } catch (err) {
      setError(err.message || 'Error al registrarse')
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setUser(null)
    setIsAuthenticated(false)
    authAPI.logout() // Esto limpia el token y el user del localStorage

    // Limpiar IndexedDB también
    try {
      await indexedDBService.setMetadata('user', null)
      // Opcionalmente limpiar todos los datos locales al cerrar sesión
      // await indexedDBService.clearAllData()
    } catch (dbErr) {
      console.warn('Error limpiando IndexedDB:', dbErr)
    }
  }, [])

  // Función para manejar logout automático cuando el token expire
  const handleTokenExpiration = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    authAPI.logout()
    setError('Su sesión ha expirado. Por favor, inicie sesión nuevamente.')
  }, [])

  const checkAuth = useCallback(async () => {
    setIsLoading(true)

    let storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')

    // Si no hay datos en localStorage, intentar recuperar de IndexedDB
    if (!storedUser && storedToken) {
      try {
        const dbUser = await indexedDBService.getMetadata('user')
        if (dbUser) {
          storedUser = JSON.stringify(dbUser)
          localStorage.setItem('user', storedUser)
        }
      } catch (dbErr) {
        console.warn('Error recuperando de IndexedDB:', dbErr)
      }
    }

    if (storedUser && storedToken) {
      try {
        // Verificar si el token ha expirado
        const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]))
        const currentTime = Date.now() / 1000

        if (tokenPayload.exp < currentTime) {
          // Token expirado, limpiar todo
          localStorage.removeItem('user')
          localStorage.removeItem('token')
          await indexedDBService.setMetadata('user', null)
          setError('Sesión expirada. Por favor, inicie sesión nuevamente.')
        } else {
          // Token válido
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setIsAuthenticated(true)
        }
      } catch (err) {
        // Si hay error al parsear, limpiar todo
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        setError('Sesión inválida')
        console.error('Error al verificar autenticación:', err)
      }
    } else if (storedUser || storedToken) {
      // Si solo existe uno de los dos, limpiar ambos
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Configurar el handler de logout para el interceptor de axios
    setAuthLogoutHandler(handleTokenExpiration)

    // Verificar autenticación al montar el componente
    checkAuth()
  }, [checkAuth, handleTokenExpiration])

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
    handleTokenExpiration
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Validación de PropTypes
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
}