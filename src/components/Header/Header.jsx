import { useState } from 'react'
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
  UserPlus
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import AlertModal from '../AlertModal/AlertModal'
import './Header.css'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { isAuthenticated, logout, isAdmin } = useAuth()
  const { showNotification } = useNotification()
  const navigate = useNavigate()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
    closeMenu()
  }

  const handleLogoutConfirm = () => {
    logout()
    setShowLogoutModal(false)
    showNotification('Has cerrado sesión correctamente', 'success')
    navigate('/')
  }

  // Navigation items data
  const mainNavItems = [
    {
      to: '/',
      label: 'Inicio',
      icon: Home
    },
    {
      to: '/reports',
      label: 'Reportes',
      icon: FileText
    },
    {
      to: '/create-report',
      label: 'Crear Reporte',
      icon: PlusCircle
    }
  ]

  const authenticatedNavItems = [
    ...(isAdmin ? [{
      to: '/admin',
      label: 'Panel Admin',
      icon: Settings,
      className: 'admin-link'
    }] : []),
    {
      to: '/profile',
      label: 'Mi Perfil',
      icon: User,
      className: 'profile-link'
    }
  ]

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo Section */}
        <div className="logo">
          <Link to="/" onClick={closeMenu}>
            <div className="logo-content">
              <img src="/src/assets/logoVozUrbana.png" alt="Voz Urbana" className="logo-icon" />
              <h1>Voz Urbana</h1>
            </div>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="menu-toggle"
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation */}
        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <ul className="nav-list">
            {/* Main Navigation Items */}
            {mainNavItems.map((item) => (
              <li key={item.to} className="nav-item">
                <NavLink to={item.to} onClick={closeMenu}>
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}

            {/* Authenticated User Navigation */}
            {isAuthenticated ? (
              <>
                {authenticatedNavItems.map((item) => (
                  <li key={item.to} className="nav-item">
                    <NavLink
                      to={item.to}
                      onClick={closeMenu}
                      className={item.className || ''}
                    >
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
                <li className="nav-item">
                  <button className="logout-button" onClick={handleLogoutClick}>
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                  </button>
                </li>
              </>
            ) : (
              /* Authentication Buttons */
              <li className="nav-item">
                <div className="auth-buttons">
                  <NavLink to="/login" onClick={closeMenu} className="login-button">
                    <LogIn size={18} />
                    <span>Iniciar Sesión</span>
                  </NavLink>
                  <NavLink to="/register" onClick={closeMenu} className="register-button">
                    <UserPlus size={18} />
                    <span>Registrarse</span>
                  </NavLink>
                </div>
              </li>
            )}
          </ul>
        </nav>
      </div>

      {/* Logout Confirmation Modal */}
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
          onClick: () => setShowLogoutModal(false),
          icon: <X size={18} />
        }}
      />
    </header>
  )
}

export default Header