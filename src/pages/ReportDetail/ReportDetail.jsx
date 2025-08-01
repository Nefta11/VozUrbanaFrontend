import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Calendar, 
  MapPin, 
  User, 
  AlertCircle 
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useReports } from '../../hooks/useReports'
import { useNotification } from '../../hooks/useNotification'
import MapView from '../../components/MapView/MapView'
import CategoryBadge from '../../components/CategoryBadge/CategoryBadge'
import Comments from '../../components/Comments/Comments'
import VoteButtons from '../../components/VoteButtons/VoteButtons'
import './ReportDetail.css'

const ReportDetail = () => {
  const { id } = useParams()
  const { getReportById } = useReports()
  const { showNotification } = useNotification()
  
  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Función utilitaria para construir la URL completa de la imagen
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    
    // Si ya es una URL completa, devolverla tal como está
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Si es una ruta relativa, construir la URL completa
    return `${baseUrl}${imagePath}`;
  };
  
  // Fetch report data
  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true)
      try {
        const reportData = await getReportById(id)
        setReport(reportData)
        setError(null)
      } catch (err) {
        setError(err.message || 'Error al cargar el reporte')
        showNotification(
          'No se pudo cargar el reporte. Por favor, intenta de nuevo.',
          'error'
        )
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchReport()
  }, [id, getReportById, showNotification])

  // Function to refresh comments when a new comment is added
  const handleCommentAdded = async () => {
    try {
      const updatedReport = await getReportById(id)
      setReport(updatedReport)
    } catch (err) {
      console.error('Error al actualizar comentarios:', err)
    }
  }
  
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: es })
    } catch {
      return dateString
    }
  }
  
  const getStatusText = (status) => {
    const statusMap = {
      nuevo: 'Nuevo',
      en_proceso: 'En Proceso',
      resuelto: 'Resuelto',
      cerrado: 'Cerrado',
      no_aprobado: 'No Aprobado'
    }
    return statusMap[status] || status
  }
  
  const getPriorityText = (priority) => {
    const priorityMap = {
      alta: 'Alta',
      media: 'Media',
      baja: 'Baja'
    }
    return priorityMap[priority] || priority
  }
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading"></div>
      </div>
    )
  }
  
  if (error || !report) {
    return (
      <div className="container">
        <div className="error-container">
          <AlertCircle size={32} />
          <h2>Error al cargar el reporte</h2>
          <p>{error || 'No se pudo encontrar el reporte solicitado'}</p>
          <Link to="/reports" className="back-link">
            Volver a Reportes
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="report-detail-page">
      <div className="container">
        <div className="report-header">
          <Link to="/reports" className="back-link enhanced-back-link">
            <span style={{display:'inline-flex',alignItems:'center',gap:'0.5rem'}}>
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>
              <span style={{fontWeight:'bold',fontSize:'1.08rem'}}>Volver a Reportes</span>
            </span>
          </Link>
          <h1>{report.titulo}</h1>
          <div className="report-meta">
            <CategoryBadge category={report.categoria} />
            <div className={`report-status status-${report.estado}`}>
              {getStatusText(report.estado)}
            </div>
            <div className="report-priority">
              Prioridad: {getPriorityText(report.prioridad)}
            </div>
          </div>
        </div>
        
        <div className="report-detail-layout">
          <div className="report-main">
          {report.imagen && (
            <div className="report-image-container">
              {/* DEBUG TEMPORAL */}
              {console.log('Imagen original:', report.imagen)}
              {console.log('URL construida:', getImageUrl(report.imagen))}
              
              <img 
                src={getImageUrl(report.imagen)} 
                alt={report.titulo} 
                className="report-detail-image"
                onError={(e) => {
                  console.error('Error cargando imagen:', e.target.src);
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
            
            <div className="report-info-card">
              <h2>Descripción</h2>
              <p className="report-description">{report.descripcion}</p>
              
              <div className="report-meta-info">
                <div className="meta-item">
                  <User size={18} />
                  <span>{report.usuario.nombre}</span>
                </div>
                <div className="meta-item">
                  <Calendar size={18} />
                  <span>{formatDate(report.fecha_creacion)}</span>
                </div>
                <div className="meta-item">
                  <MapPin size={18} />
                  <span>{report.ubicacion}</span>
                </div>
              </div>
              
              <VoteButtons 
                reportId={report.id}
                initialVotes={{
                  positivos: report.votos_positivos,
                  negativos: report.votos_negativos
                }}
              />
            </div>
            
            <div className="report-info-card">
              <h2>Ubicación</h2>
              <div className="report-map">
                <MapView 
                  height="300px" 
                  zoom={15}
                  showPopups={false}
                />
              </div>
            </div>
            
            <div className="report-info-card">
              <Comments 
                reportId={report.id} 
                comments={report.comentarios || []} 
                onCommentAdded={handleCommentAdded}
              />
            </div>
          </div>
          
          <div className="report-sidebar">
            <div className="report-info-card status-tracker">
              <h2>Estado del Reporte</h2>
              <div className="status-timeline">
                <div className={`status-step ${report.estado === 'nuevo' || report.estado === 'en_proceso' || report.estado === 'resuelto' ? 'active' : ''}`}>
                  <div className="status-dot"></div>
                  <div className="status-label">Nuevo</div>
                  <div className="status-date">
                    {formatDate(report.fecha_creacion)}
                  </div>
                </div>
                
                <div className={`status-step ${report.estado === 'en_proceso' || report.estado === 'resuelto' ? 'active' : ''}`}>
                  <div className="status-dot"></div>
                  <div className="status-label">En Proceso</div>
                  <div className="status-date">
                    {report.estado === 'en_proceso' || report.estado === 'resuelto' ? 
                      'Revisando el problema' : ''}
                  </div>
                </div>
                
                <div className={`status-step ${report.estado === 'resuelto' ? 'active' : ''}`}>
                  <div className="status-dot"></div>
                  <div className="status-label">Resuelto</div>
                  <div className="status-date">
                    {report.estado === 'resuelto' ? 'Problema solucionado' : ''}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="report-info-card similar-reports">
              <h2>Reportes Similares</h2>
              <p className="coming-soon">Próximamente: Reportes relacionados por categoría o ubicación.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportDetail