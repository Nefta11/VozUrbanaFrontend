import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Voz Urbana</h3>
          <p>Sistema participativo para reportes de salud pública y mejora comunitaria.</p>
        </div>
        
        <div className="footer-section">
          <h4>Enlaces</h4>
          <ul className="footer-links">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/reports">Reportes</Link></li>
            <li><Link to="/create-report">Crear Reporte</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Categorías</h4>
          <ul className="footer-links">
            <li><Link to="/reports?category=saneamiento">Saneamiento</Link></li>
            <li><Link to="/reports?category=infraestructura">Infraestructura</Link></li>
            <li><Link to="/reports?category=salud_publica">Salud Pública</Link></li>
            <li><Link to="/reports?category=seguridad">Seguridad</Link></li>
            <li><Link to="/reports?category=medio_ambiente">Medio Ambiente</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Cuenta</h4>
          <ul className="footer-links">
            <li><Link to="/login">Iniciar Sesión</Link></li>
            <li><Link to="/register">Registrarse</Link></li>
            <li><Link to="/profile">Mi Perfil</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} Voz Urbana. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

export default Footer