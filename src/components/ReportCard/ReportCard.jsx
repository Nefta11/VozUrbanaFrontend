import { useState, memo, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  Heart,
  TrendingUp,
  Image as ImageIcon,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import CategoryBadge from '../CategoryBadge/CategoryBadge'
import VoteButtons from '../VoteButtons/VoteButtons'
import './ReportCard.css'
import PropTypes from 'prop-types'

// Configuración externa para evitar recreación en cada render
const REPORT_CARD_CONFIG = {
  icons: {
    size: {
      small: 14,
      medium: 16,
      large: 18,
      xlarge: 48
    }
  },
  status: {
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
    },
    no_aprobado: {
      text: 'No Aprobado',
      icon: X,
      color: 'red'
    }
  },
  priority: {
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
}

// Función utilitaria para formatear fechas
const formatReportDate = (dateString) => {
  try {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: es })
  } catch (error) {
    console.error('Error formateando fecha:', error)
    return dateString
  }
}

// Función utilitaria para obtener información del estado
const getStatusInfo = (status) => {
  return REPORT_CARD_CONFIG.status[status] || REPORT_CARD_CONFIG.status.nuevo
}

// Función utilitaria para obtener información de prioridad
const getPriorityInfo = (priority) => {
  return REPORT_CARD_CONFIG.priority[priority] || REPORT_CARD_CONFIG.priority.media
}

// Agregar debugging temporal a la función getImageUrl
const getImageUrl = (imagePath) => {
  console.log('🔍 Procesando imagen:', imagePath); // DEBUG
  
  if (!imagePath) return null;
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  
  // Si ya es una URL completa, devolverla tal como está
  if (imagePath.startsWith('http')) {
    console.log('✅ URL completa detectada:', imagePath); // DEBUG
    return imagePath;
  }
  
  // Si es una ruta relativa, construir la URL completa
  const fullUrl = `${baseUrl}${imagePath}`;
  console.log('🔗 URL construida:', fullUrl); // DEBUG
  return fullUrl;
};

// Componente de imagen optimizado - MODIFICADO
// Mejorar el debugging en ReportImage
const ReportImage = memo(({ report, onImageLoad, onImageError, imageLoaded, imageError }) => {
  const imageUrl = getImageUrl(report.imagen);
  
  console.log('📸 ReportImage render:', {
    reportId: report.id,
    imagePath: report.imagen,
    imageUrl,
    imageLoaded,
    imageError
  }); // DEBUG

  const handleImageLoad = () => {
    console.log('✅ Imagen cargada exitosamente:', imageUrl);
    onImageLoad();
  };

  const handleImageError = (e) => {
    console.error('❌ Error cargando imagen:', {
      url: e.target.src,
      reportId: report.id,
      originalPath: report.imagen
    });
    onImageError();
  };
  
  if (imageUrl && !imageError) {
    return (
      <>
        {!imageLoaded && (
          <div className="loading-shimmer" style={{ height: '200px' }} aria-label="Cargando imagen">
            <div className="shimmer-animation"></div>
          </div>
        )}
        <img
          src={imageUrl}
          alt={`Imagen del reporte: ${report.titulo}`}
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
      </>
    )
  }

  return (
    <div className="no-image-placeholder">
      <ImageIcon size={REPORT_CARD_CONFIG.icons.size.xlarge} color="#cbd5e1" aria-hidden="true" />
      <span>Sin imagen</span>
    </div>
  )
})
ReportImage.displayName = 'ReportImage'

// Componente de badge de estado optimizado
const StatusBadge = memo(({ status }) => {
  const statusInfo = getStatusInfo(status)
  const StatusIcon = statusInfo.icon

  return (
    <div
      className={`report-status status-${status}`}
      title={`Estado: ${statusInfo.text}`}
      role="img"
      aria-label={`Estado: ${statusInfo.text}`}
    >
      <StatusIcon size={REPORT_CARD_CONFIG.icons.size.medium} aria-hidden="true" />
      <span>{statusInfo.text}</span>
    </div>
  )
})
StatusBadge.displayName = 'StatusBadge'

// Componente de indicador de prioridad optimizado
const PriorityIndicator = memo(({ priority }) => {
  const priorityInfo = getPriorityInfo(priority)

  return (
    <div
      className={`priority-indicator priority-${priority}`}
      title={priorityInfo.text}
      role="img"
      aria-label={priorityInfo.text}
    />
  )
})
PriorityIndicator.displayName = 'PriorityIndicator'
// Componente principal optimizado
const ReportCard = memo(({ report }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Manejadores optimizados para la imagen
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  const handleImageError = useCallback(() => {
    setImageError(true)
    setImageLoaded(true)
  }, [])

  // Cálculos memorizados
  const totalVotes = useMemo(() => {
    return report.votos_positivos + report.votos_negativos
  }, [report.votos_positivos, report.votos_negativos])

  const commentsCount = useMemo(() => {
    return report.comentarios?.length || 0
  }, [report.comentarios])

  const formattedDate = useMemo(() => {
    return formatReportDate(report.fecha_creacion)
  }, [report.fecha_creacion])

  return (
    <article className={`report-card priority-${report.prioridad}`}>
      {/* Indicador de prioridad */}
      <PriorityIndicator priority={report.prioridad} />

      {/* Sección de imagen del reporte */}
      <div className="report-image">
        <ReportImage
          report={report}
          onImageLoad={handleImageLoad}
          onImageError={handleImageError}
          imageLoaded={imageLoaded}
          imageError={imageError}
        />
        <StatusBadge status={report.estado} />
      </div>

      {/* Contenido del reporte */}
      <div className="report-content">
        {/* Título */}
        <h3 className="report-title">
          <Link
            to={`/reports/${report.id}`}
            title={`Ver detalles: ${report.titulo}`}
          >
            {report.titulo}
          </Link>
        </h3>

        {/* Meta información */}
        <div className="report-meta">
          <CategoryBadge category={report.categoria} />
          <div className="report-date" title={`Fecha de creación: ${formattedDate}`}>
            <Calendar size={REPORT_CARD_CONFIG.icons.size.medium} aria-hidden="true" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Descripción */}
        <p className="report-description" title={report.descripcion}>
          {report.descripcion}
        </p>

        {/* Ubicación */}
        <div className="report-location" title={`Ubicación: ${report.ubicacion}`}>
          <MapPin size={REPORT_CARD_CONFIG.icons.size.medium} className="location-icon" aria-hidden="true" />
          <span>{report.ubicacion}</span>
        </div>

        {/* Footer con acciones */}
        <footer className="report-footer">
          {/* Sección de votación */}
          <VoteButtons
            reportId={report.id}
            initialVotes={{
              positivos: report.votos_positivos,
              negativos: report.votos_negativos
            }}
            compact={true}
          />

          {/* Enlace a comentarios */}
          <Link
            to={`/reports/${report.id}`}
            className="report-comments"
            aria-label={`Ver ${commentsCount} comentarios del reporte`}
            title={`${commentsCount} comentarios`}
          >
            <MessageSquare size={REPORT_CARD_CONFIG.icons.size.large} aria-hidden="true" />
            <span>{commentsCount} comentario{commentsCount !== 1 ? 's' : ''}</span>
          </Link>
        </footer>

        {/* Estadísticas adicionales */}
        {totalVotes > 0 && (
          <div className="report-stats" title={`Total de ${totalVotes} votos`}>
            <Heart size={REPORT_CARD_CONFIG.icons.size.small} aria-hidden="true" />
            <span>{totalVotes} interacciones</span>
          </div>
        )}
      </div>
    </article>
  )
})

// Asignar nombre para el display name de React DevTools
ReportCard.displayName = 'ReportCard'

// PropTypes para subcomponentes
ReportImage.propTypes = {
  report: PropTypes.shape({
    imagen: PropTypes.string,
    titulo: PropTypes.string.isRequired
  }).isRequired,
  onImageLoad: PropTypes.func.isRequired,
  onImageError: PropTypes.func.isRequired,
  imageLoaded: PropTypes.bool.isRequired,
  imageError: PropTypes.bool.isRequired
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired
}

PriorityIndicator.propTypes = {
  priority: PropTypes.string.isRequired
}

// PropTypes para el componente principal
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