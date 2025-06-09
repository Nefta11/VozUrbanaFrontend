import { Link } from 'react-router-dom'
import { ThumbsUp, ThumbsDown, MessageSquare, Calendar, MapPin, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '../../hooks/useAuth'
import { useReports } from '../../hooks/useReports'
import { useNotification } from '../../hooks/useNotification'
import CategoryBadge from '../CategoryBadge/CategoryBadge'
import './ReportCard.css'

const ReportCard = ({ report }) => {
  const { isAuthenticated, user } = useAuth()
  const { voteReport } = useReports()
  const { showNotification } = useNotification()
  
  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      showNotification('Debes iniciar sesión para votar', 'warning')
      return
    }
    
    try {
      await voteReport(report.id, voteType, user.id)
      showNotification('Voto registrado', 'success')
    } catch (error) {
      showNotification('Error al votar', 'error')
    }
  }
  
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es })
    } catch (error) {
      return dateString
    }
  }
  
  const getStatusInfo = (status) => {
    const statusMap = {
      nuevo: {
        text: 'Nuevo',
        icon: AlertCircle
      },
      en_proceso: {
        text: 'En Proceso',
        icon: Clock
      },
      resuelto: {
        text: 'Resuelto',
        icon: CheckCircle
      },
      cerrado: {
        text: 'Cerrado',
        icon: CheckCircle
      }
    }
    return statusMap[status] || statusMap.nuevo
  }
  
  const getUserVote = () => {
    if (!isAuthenticated || !user) return null
    return report.votos_usuarios?.[user.id] || null
  }
  
  const statusInfo = getStatusInfo(report.estado)
  const StatusIcon = statusInfo.icon
  const userVote = getUserVote()
  
  return (
    <div className={`report-card priority-${report.prioridad}`}>
      <div className={`priority-indicator priority-${report.prioridad}`}></div>
      
      <div className="report-image">
        {report.imagen && (
          <img src={report.imagen} alt={report.titulo} loading="lazy" />
        )}
        <div className={`report-status status-${report.estado}`}>
          <StatusIcon size={16} />
          {statusInfo.text}
        </div>
      </div>
      
      <div className="report-content">
        <h3 className="report-title">
          <Link to={`/reports/${report.id}`}>{report.titulo}</Link>
        </h3>
        
        <div className="report-meta">
          <CategoryBadge category={report.categoria} />
          <span className="report-date">
            <Calendar size={16} />
            {formatDate(report.fecha_creacion)}
          </span>
        </div>
        
        <p className="report-description">{report.descripcion}</p>
        
        <div className="report-location">
          <MapPin size={16} className="location-icon" />
          <span>{report.ubicacion}</span>
        </div>
        
        <div className="report-footer">
          <div className="report-votes">
            <button 
              className={`vote-button vote-up ${userVote === 'up' ? 'active' : ''}`}
              onClick={() => handleVote('up')}
              aria-label="Voto positivo"
            >
              <ThumbsUp size={18} />
              <span>{report.votos_positivos}</span>
            </button>
            
            <button 
              className={`vote-button vote-down ${userVote === 'down' ? 'active' : ''}`}
              onClick={() => handleVote('down')}
              aria-label="Voto negativo"
            >
              <ThumbsDown size={18} />
              <span>{report.votos_negativos}</span>
            </button>
          </div>
          
          <Link to={`/reports/${report.id}`} className="report-comments">
            <MessageSquare size={18} />
            <span>{report.comentarios?.length || 0} comentarios</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ReportCard