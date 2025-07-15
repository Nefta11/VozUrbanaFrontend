import { useState, memo, useCallback } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LogIn, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import AlertModal from '../AlertModal/AlertModal'
import PropTypes from 'prop-types'

// Configuración externa para evitar recreación en cada render
const PROTECTED_ROUTE_CONFIG = {
  modal: {
    type: 'warning',
    title: 'Acceso Restringido',
    message: 'Debes iniciar sesión para acceder a esta sección. Por favor, inicia sesión o regístrate para continuar.',
    iconSize: 18
  },
  actions: {
    login: {
      label: 'Iniciar Sesión',
      path: '/login'
    },
    cancel: {
      label: 'Cancelar',
      path: '/'
    }
  }
}

// Componente de carga optimizado
const LoadingSpinner = memo(() => (
  <div className="loading-container" role="status" aria-label="Cargando...">
    <div className="loading" aria-hidden="true"></div>
  </div>
))
LoadingSpinner.displayName = 'LoadingSpinner'

// Componente principal optimizado
const ProtectedRoute = memo(({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const [shouldNavigate, setShouldNavigate] = useState(null)
  const location = useLocation()

  // Manejadores optimizados para las acciones del modal
  const handleLoginAction = useCallback(() => {
    setShouldNavigate(PROTECTED_ROUTE_CONFIG.actions.login.path)
  }, [])

  const handleCancelAction = useCallback(() => {
    setShouldNavigate(PROTECTED_ROUTE_CONFIG.actions.cancel.path)
  }, [])

  // Mostrar spinner de carga mientras se verifica autenticación
  if (isLoading) {
    return <LoadingSpinner />
  }

  // Si hay una navegación pendiente, ejecutarla
  if (shouldNavigate) {
    return (
      <Navigate
        to={shouldNavigate}
        state={{ from: location }}
        replace
      />
    )
  }

  // Si no está autenticado, mostrar modal
  if (!isAuthenticated) {
    return (
      <AlertModal
        isOpen={true}
        type={PROTECTED_ROUTE_CONFIG.modal.type}
        title={PROTECTED_ROUTE_CONFIG.modal.title}
        message={PROTECTED_ROUTE_CONFIG.modal.message}
        onClose={handleCancelAction}
        primaryAction={{
          label: PROTECTED_ROUTE_CONFIG.actions.login.label,
          onClick: handleLoginAction,
          icon: <LogIn size={PROTECTED_ROUTE_CONFIG.modal.iconSize} aria-hidden="true" />
        }}
        secondaryAction={{
          label: PROTECTED_ROUTE_CONFIG.actions.cancel.label,
          onClick: handleCancelAction,
          icon: <X size={PROTECTED_ROUTE_CONFIG.modal.iconSize} aria-hidden="true" />
        }}
      />
    )
  }

  // Si está autenticado, renderizar children
  return children
})

// Asignar nombre para el display name de React DevTools
ProtectedRoute.displayName = 'ProtectedRoute'

// PropTypes para validación
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
}

export default ProtectedRoute