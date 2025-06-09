import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  MapPin, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight,
  Clock,
  XCircle
} from 'lucide-react'
import { useReports } from '../../hooks/useReports'
import MapView from '../../components/MapView/MapView'
import ReportCard from '../../components/ReportCard/ReportCard'
import CategoryBadge from '../../components/CategoryBadge/CategoryBadge'
import './Home.css'

const Home = () => {
  const { reports, categories, isLoading } = useReports()
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    inProcess: 0,
    new: 0,
    closed: 0
  })
  const [featuredReports, setFeaturedReports] = useState([])
  
  // Calculate statistics
  useEffect(() => {
    if (reports.length > 0) {
      setStats({
        total: reports.length,
        resolved: reports.filter(r => r.estado === 'resuelto').length,
        inProcess: reports.filter(r => r.estado === 'en_proceso').length,
        new: reports.filter(r => r.estado === 'nuevo').length,
        closed: reports.filter(r => r.estado === 'cerrado').length
      })
      
      // Set featured reports (3 most voted)
      const sortedReports = [...reports].sort((a, b) => 
        (b.votos_positivos - b.votos_negativos) - 
        (a.votos_positivos - a.votos_negativos)
      )
      setFeaturedReports(sortedReports.slice(0, 3))
    }
  }, [reports])
  
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Voz Urbana</h1>
          <p className="hero-subtitle">
            Plataforma ciudadana para reportar problemas de salud pública e infraestructura en tu comunidad
          </p>
          <div className="hero-buttons">
            <Link to="/create-report" className="hero-button primary">
              Crear Reporte
            </Link>
            <Link to="/reports" className="hero-button secondary">
              Ver Reportes
            </Link>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon total">
                <FileText size={24} />
              </div>
              <div className="stat-content">
                <h3>Total Reportes</h3>
                <p className="stat-number">{stats.total}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon new">
                <AlertCircle size={24} />
              </div>
              <div className="stat-content">
                <h3>Nuevos</h3>
                <p className="stat-number">{stats.new}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon in-process">
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <h3>En Proceso</h3>
                <p className="stat-number">{stats.inProcess}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon resolved">
                <CheckCircle size={24} />
              </div>
              <div className="stat-content">
                <h3>Resueltos</h3>
                <p className="stat-number">{stats.resolved}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon closed">
                <XCircle size={24} />
              </div>
              <div className="stat-content">
                <h3>Cerrados</h3>
                <p className="stat-number">{stats.closed}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="map-section">
        <div className="container">
          <div className="section-header">
            <h2>Mapa de Reportes</h2>
            <p>Explora los reportes de tu comunidad en el mapa interactivo</p>
          </div>
          <MapView height="500px" zoom={13} />
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Categorías de Reportes</h2>
            <p>Selecciona la categoría para ver reportes específicos</p>
          </div>
          
          <div className="categories-grid">
            {categories.map(category => (
              <Link 
                to={`/reports?category=${category.id}`} 
                key={category.id}
                className="category-card"
              >
                <div className="category-icon">
                  <CategoryBadge category={category.id} />
                </div>
                <h3>{category.nombre}</h3>
                <ChevronRight size={18} className="category-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Reports Section */}
      <section className="featured-reports-section">
        <div className="container">
          <div className="section-header">
            <h2>Reportes Destacados</h2>
            <p>Los reportes más relevantes de la comunidad</p>
          </div>
          
          {isLoading ? (
            <div className="loading-container">
              <div className="loading"></div>
            </div>
          ) : (
            <div className="featured-reports-grid">
              {featuredReports.map(report => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
          
          <div className="view-all-link">
            <Link to="/reports">
              Ver todos los reportes
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2>Cómo Funciona</h2>
            <p>Participa en la mejora de tu comunidad en simples pasos</p>
          </div>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Crea un Reporte</h3>
              <p>Identifica un problema en tu comunidad y créalo usando el formulario</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Geolocaliza el Problema</h3>
              <p>Marca la ubicación exacta en el mapa interactivo</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Añade Detalles</h3>
              <p>Describe el problema y añade fotos si es posible</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Seguimiento</h3>
              <p>Sigue el estado del reporte y recibe actualizaciones</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>¿Ves un problema en tu comunidad?</h2>
            <p>Tu participación es clave para mejorar nuestra ciudad</p>
            <Link to="/create-report" className="cta-button">
              Crear un Reporte Ahora
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home