import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'
import './NotFound.css'

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <h1>404</h1>
          <h2>Página No Encontrada</h2>
          <p>Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
          
          <div className="not-found-actions">
            <Link to="/" className="not-found-button primary">
              <Home size={18} />
              Volver al Inicio
            </Link>
            <Link to="/reports" className="not-found-button secondary">
              <Search size={18} />
              Explorar Reportes
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound