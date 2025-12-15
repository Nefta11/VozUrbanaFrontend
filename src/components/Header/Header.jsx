import { useState, useCallback, memo } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Home,
  FileText,
  PlusCircle,
  LogIn,
  UserPlus,
  BarChart2,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import AlertModal from '../AlertModal/AlertModal'
import PropTypes from 'prop-types'
import './Header.css'

// Configuración de navegación de autenticación
const AUTH_CONFIG = [
  {
    to: '/login',
    label: 'Iniciar Sesión',
    icon: LogIn,
    type: 'login'
  },
  {
    to: '/register',
    label: 'Registrarse',
    icon: UserPlus,
    type: 'register'
  }
]

// Componente para renderizar elementos de navegación
const NavItem = memo(({ item, onClick, className = '' }) => (
  <li className="nav-item">
    <NavLink
      to={item.to}
      onClick={onClick}
      className={className}
      aria-label={`Ir a ${item.label}`}
    >
      <item.icon size={18} aria-hidden="true" />
      <span>{item.label}</span>
    </NavLink>
  </li>
))

NavItem.displayName = 'NavItem'

// Componente para botones de autenticación
const AuthButtons = memo(({ onClose }) => (
  <li className="nav-item">
    <div className="auth-buttons">
      {AUTH_CONFIG.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onClose}
          className={`${item.type}-button`}
          aria-label={item.label}
        >
          <item.icon size={18} aria-hidden="true" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  </li>
))

AuthButtons.displayName = 'AuthButtons'

// Componente principal del header
const Header = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { isAuthenticated, logout, isAdmin } = useAuth()
  const { showNotification } = useNotification()
  const navigate = useNavigate()

  // Handlers optimizados con useCallback
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  const handleLogoutClick = useCallback(() => {
    setShowLogoutModal(true)
    closeMenu()
  }, [closeMenu])

  const handleLogoutConfirm = useCallback(() => {
    logout()
    setShowLogoutModal(false)
    showNotification('Has cerrado sesión correctamente', 'success')
    navigate('/login')
  }, [logout, showNotification, navigate])

  const handleLogoutCancel = useCallback(() => {
    setShowLogoutModal(false)
  }, [])

  // Configuración de elementos de navegación según el tipo de usuario
  const getNavigationItems = useCallback(() => {
    const mainItems = []

    // Solo mostrar "Inicio" para usuarios que NO son administradores
    if (!isAdmin) {
      mainItems.push({
        to: '/',
        label: 'Inicio',
        icon: Home
      })
    }

    mainItems.push({
      to: '/reports',
      label: 'Reportes',
      icon: FileText
    })

    // Solo mostrar "Crear Reporte" para usuarios que NO son administradores
    if (!isAdmin) {
      mainItems.push({
        to: '/create-report',
        label: 'Crear Reporte',
        icon: PlusCircle
      })
    }

    // Mostrar "Dashboard" solo para admin
    if (isAdmin) {
      mainItems.push({
        to: '/dashboard',
        label: 'Dashboard',
        icon: BarChart2
      })

    // ✅ NUEVO - Agregar Predicciones solo para admin
    mainItems.push({
      to: '/predictions',
      label: 'Predicciones',
      icon: TrendingUp
    })
    }

    return mainItems
  }, [isAdmin])

  // Configuración de elementos de navegación autenticados
  const getAuthenticatedNavItems = useCallback(() => {
    const items = []

    if (isAdmin) {
      items.push({
        to: '/admin',
        label: 'Panel Admin',
        icon: Settings,
        className: 'admin-link'
      })
    } else {
      // Solo mostrar "Mi Perfil" para usuarios que NO son administradores
      items.push({
        to: '/profile',
        label: 'Mi Perfil',
        icon: User,
        className: 'profile-link'
      })
    }

    return items
  }, [isAdmin])

  return (
    <header className="header" role="banner">
      <div className="header-container">
        {/* Sección del Logo */}
        <div className="logo">
          <Link
            to="/"
            onClick={closeMenu}
            aria-label="Ir al inicio - Voz Urbana"
          >
            <div className="logo-content">
              <img
                src="/manifest-icon-512.png"
                alt="Voz Urbana Logo"
                className="logo-icon"
              />
              <h1>Voz Urbana</h1>
            </div>
          </Link>
        </div>

        {/* Toggle del Menú Móvil */}
        <button
          className="menu-toggle"
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navegación */}
        <nav
          className={`nav ${isMenuOpen ? 'nav-open' : ''}`}
          role="navigation"
          aria-label="Navegación principal"
        >
          <ul className="nav-list" role="menubar">
            {/* Elementos de Navegación Principal */}
            {getNavigationItems().map((item) => (
              <NavItem
                key={item.to}
                item={item}
                onClick={closeMenu}
              />
            ))}

            {/* Navegación de Usuario Autenticado */}
            {isAuthenticated ? (
              <>
                {getAuthenticatedNavItems().map((item) => (
                  <NavItem
                    key={item.to}
                    item={item}
                    onClick={closeMenu}
                    className={item.className}
                  />
                ))}
                <li className="nav-item">
                  <button
                    className="logout-button"
                    onClick={handleLogoutClick}
                    aria-label="Cerrar sesión"
                  >
                    <LogOut size={18} aria-hidden="true" />
                    <span>Cerrar Sesión</span>
                  </button>
                </li>
              </>
            ) : (
              // Botones de Autenticación
              <AuthButtons onClose={closeMenu} />
            )}
          </ul>
        </nav>
      </div>

      {/* Modal de Confirmación de Logout */}
      <AlertModal
        isOpen={showLogoutModal}
        type="warning"
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        primaryAction={{
          label: 'Cerrar Sesión',
          onClick: handleLogoutConfirm,
          icon: <LogOut size={18} />
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: handleLogoutCancel,
          icon: <X size={18} />
        }}
        onClose={handleLogoutCancel}
      />
    </header>
  )
})

Header.displayName = 'Header'

// PropTypes para subcomponentes
NavItem.propTypes = {
  item: PropTypes.shape({
    to: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string
}

AuthButtons.propTypes = {
  onClose: PropTypes.func.isRequired
}

export default Header