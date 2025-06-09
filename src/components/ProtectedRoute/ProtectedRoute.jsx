import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LogIn, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import AlertModal from '../AlertModal/AlertModal'
import PropTypes from 'prop-types'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const [showModal, setShowModal] = useState(true)
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <AlertModal
          isOpen={showModal}
          type="warning"
          title="Acceso Restringido"
          message="Debes iniciar sesión para acceder a esta sección. Por favor, inicia sesión o regístrate para continuar."
          primaryAction={{
            label: 'Iniciar Sesión',
            onClick: () => {
              setShowModal(false)
              return <Navigate to="/login\" state={{ from: location }} replace />
            },
            icon: <LogIn size={18} />
          }}
          secondaryAction={{
            label: 'Cancelar',
            onClick: () => {
              setShowModal(false)
              return <Navigate to="/\" replace />
            },
            icon: <X size={18} />
          }}
        />
        <Navigate to="/login" state={{ from: location }} replace />
      </>
    )
  }

  return children
}
ProtectedRoute.propTypes = {
  children: PropTypes.node
}

export default ProtectedRoute