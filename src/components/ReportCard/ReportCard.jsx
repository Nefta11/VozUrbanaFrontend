import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  Heart,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '../../hooks/useAuth'
import { useReports } from '../../hooks/useReports'
import { useNotification } from '../../hooks/useNotification'
import CategoryBadge from '../CategoryBadge/CategoryBadge'
import './ReportCard.css'
import PropTypes from 'prop-types'

const ReportCard = ({ report }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
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
      const message = voteType === 'up' ? 'Voto positivo registrado' : 'Voto negativo registrado'
      showNotification(message, 'success')
    } catch (error) {
      console.error('Error voting:', error)
      showNotification('Error al registrar el voto', 'error')
    }
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es })
    } catch (error) {
      console.error('Error formatting date:', error)
      return dateString
    }
  }

  const getStatusInfo = (status) => {
    const statusMap = {
      nuevo: {
        text: 'Nuevo',
        icon: AlertCircle,
        color: 'blue'
      },
      en_proceso: {
        text: 'En Proceso',
        icon: Clock,
        color: 'yellow'
      },
      resuelto: {
        text: 'Resuelto',
        icon: CheckCircle,
        color: 'green'
      },
      cerrado: {
        text: 'Cerrado',
        icon: CheckCircle,
        color: 'gray'
      }
    }
    return statusMap[status] || statusMap.nuevo
  }

  const getPriorityInfo = (priority) => {
    const priorityMap = {
      alta: {
        text: 'Alta Prioridad',
        color: 'red',
        icon: TrendingUp
      },
      media: {
        text: 'Prioridad Media',
        color: 'yellow',
        icon: TrendingUp
      },
      baja: {
        text: 'Baja Prioridad',
        color: 'green',
        icon: TrendingUp
      }
    }
    return priorityMap[priority] || priorityMap.media
  }

  const getUserVote = () => {
    if (!isAuthenticated || !user) return null
    return report.votos_usuarios?.[user.id] || null
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(true)
  }

  const statusInfo = getStatusInfo(report.estado)
  const priorityInfo = getPriorityInfo(report.prioridad)
  const StatusIcon = statusInfo.icon
  const userVote = getUserVote()
  const totalVotes = report.votos_positivos + report.votos_negativos
  const commentsCount = report.comentarios?.length || 0

  return (
    <article className={`report-card priority-${report.prioridad}`}>
      {/* Priority Indicator */}
      <div
        className={`priority-indicator priority-${report.prioridad}`}
        title={priorityInfo.text}
        role="img"
        aria-label={priorityInfo.text}
      />

      {/* Report Image Section */}
      <div className="report-image">
        {report.imagen && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="loading-shimmer" style={{ height: '100%' }} />
            )}
            <img
              src={report.imagen}
              alt={`Imagen del reporte: ${report.titulo}`}
              loading="lazy"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ display: imageLoaded ? 'block' : 'none' }}
            />
          </>
        ) : (
          <div className="no-image-placeholder">
            <ImageIcon size={48} color="#cbd5e1" />
            <span>Sin imagen</span>
          </div>
        )}

        {/* Status Badge */}
        <div
          className={`report-status status-${report.estado}`}
          title={`Estado: ${statusInfo.text}`}
        >
          <StatusIcon size={16} />
          <span>{statusInfo.text}</span>
        </div>
      </div>

      {/* Report Content */}
      <div className="report-content">
        {/* Title */}
        <h3 className="report-title">
          <Link
            to={`/reports/${report.id}`}
            title={`Ver detalles: ${report.titulo}`}
          >
            {report.titulo}
          </Link>
        </h3>

        {/* Meta Information */}
        <div className="report-meta">
          <CategoryBadge category={report.categoria} />
          <div className="report-date" title={`Fecha de creación: ${formatDate(report.fecha_creacion)}`}>
            <Calendar size={16} />
            <span>{formatDate(report.fecha_creacion)}</span>
          </div>
        </div>

        {/* Description */}
        <p className="report-description" title={report.descripcion}>
          {report.descripcion}
        </p>

        {/* Location */}
        <div className="report-location" title={`Ubicación: ${report.ubicacion}`}>
          <MapPin size={16} className="location-icon" />
          <span>{report.ubicacion}</span>
        </div>

        {/* Footer with Actions */}
        <footer className="report-footer">
          {/* Voting Section */}
          <div className="report-votes" role="group" aria-label="Votación del reporte">
            <button
              className={`vote-button vote-up ${userVote === 'up' ? 'active' : ''}`}
              onClick={() => handleVote('up')}
              aria-label={`Votar positivo (${report.votos_positivos} votos)`}
              title={`${report.votos_positivos} votos positivos`}
              disabled={!isAuthenticated}
            >
              <ThumbsUp size={18} />
              <span>{report.votos_positivos}</span>
            </button>

            <button
              className={`vote-button vote-down ${userVote === 'down' ? 'active' : ''}`}
              onClick={() => handleVote('down')}
              aria-label={`Votar negativo (${report.votos_negativos} votos)`}
              title={`${report.votos_negativos} votos negativos`}
              disabled={!isAuthenticated}
            >
              <ThumbsDown size={18} />
              <span>{report.votos_negativos}</span>
            </button>
          </div>

          {/* Comments Link */}
          <Link
            to={`/reports/${report.id}`}
            className="report-comments"
            aria-label={`Ver ${commentsCount} comentarios del reporte`}
            title={`${commentsCount} comentarios`}
          >
            <MessageSquare size={18} />
            <span>{commentsCount} comentario{commentsCount !== 1 ? 's' : ''}</span>
          </Link>
        </footer>

        {/* Additional Stats (optional enhancement) */}
        {totalVotes > 0 && (
          <div className="report-stats" title={`Total de ${totalVotes} votos`}>
            <Heart size={14} />
            <span>{totalVotes} interacciones</span>
          </div>
        )}
      </div>
    </article>
  )
}

ReportCard.propTypes = {
  report: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    titulo: PropTypes.string.isRequired,
    descripcion: PropTypes.string.isRequired,
    ubicacion: PropTypes.string.isRequired,
    categoria: PropTypes.string.isRequired,
    estado: PropTypes.string.isRequired,
    prioridad: PropTypes.string.isRequired,
    imagen: PropTypes.string,
    fecha_creacion: PropTypes.string.isRequired,
    votos_positivos: PropTypes.number.isRequired,
    votos_negativos: PropTypes.number.isRequired,
    votos_usuarios: PropTypes.object,
    comentarios: PropTypes.array
  }).isRequired
}

export default ReportCard