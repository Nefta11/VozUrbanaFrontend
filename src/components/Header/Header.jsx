import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut, Settings } from 'lucide-react'
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
  
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/" onClick={closeMenu}>
            <h1>Voz Urbana</h1>
          </Link>
        </div>
        
        <button 
          className="menu-toggle" 
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'} 
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink to="/" onClick={closeMenu}>Inicio</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/reports" onClick={closeMenu}>Reportes</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/create-report" onClick={closeMenu}>Crear Reporte</NavLink>
            </li>
            
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <li className="nav-item">
                    <NavLink to="/admin\" onClick={closeMenu} className="admin-link">
                      <Settings size={18} />
                      Panel Admin
                    </NavLink>
                  </li>
                )}
                <li className="nav-item">
                  <NavLink to="/profile" onClick={closeMenu} className="profile-link">
                    <User size={18} />
                    <span>Mi Perfil</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <button className="logout-button" onClick={handleLogoutClick}>
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink to="/login" onClick={closeMenu} className="login-button">
                    Iniciar Sesión
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/register" onClick={closeMenu} className="register-button">
                    Registrarse
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

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