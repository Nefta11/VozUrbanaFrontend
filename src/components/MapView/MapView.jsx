import { useEffect, useState, memo, useCallback, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import { AlertCircle, Clock, CheckCircle, ChevronRight } from 'lucide-react'
import { useReports } from '../../hooks/useReports'
import { useGeolocation } from '../../hooks/useGeolocation'
import CategoryBadge from '../CategoryBadge/CategoryBadge'
import './MapView.css'
import PropTypes from 'prop-types'

// Configuración externa para evitar recreación en cada render
const MAP_VIEW_CONFIG = {
  defaultCenter: [20.2745, -97.9557], // Xicotepec por defecto
  defaultZoom: 12,
  locationErrorTimeout: 5000, // 5 segundos
  regionBounds: {
    latMin: 20.1,
    latMax: 20.4,
    lngMin: -98.1,
    lngMax: -97.9
  },
  marker: {
    iconSize: [40, 56],
    iconAnchor: [20, 56],
    popupAnchor: [0, -48],
    className: 'custom-marker'
  },
  tileLayer: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  popup: {
    className: 'map-popup',
    descriptionLength: 100
  }
}

// Configuración de estados de reportes
const STATUS_CONFIG = {
  nuevo: {
    text: 'Nuevo',
    icon: AlertCircle,
    className: 'status-nuevo'
  },
  en_proceso: {
    text: 'En Proceso',
    icon: Clock,
    className: 'status-en_proceso'
  },
  resuelto: {
    text: 'Resuelto',
    icon: CheckCircle,
    className: 'status-resuelto'
  },
  cerrado: {
    text: 'Cerrado',
    icon: CheckCircle,
    className: 'status-cerrado'
  }
}

// Función utilitaria para verificar si una ubicación está en la región
const isLocationInRegion = (location) => {
  const { regionBounds } = MAP_VIEW_CONFIG
  return location &&
    location.latitude >= regionBounds.latMin &&
    location.latitude <= regionBounds.latMax &&
    location.longitude >= regionBounds.lngMin &&
    location.longitude <= regionBounds.lngMax
}

// Función utilitaria para obtener información del estado del reporte
const getStatusInfo = (status) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.nuevo
}

// Función utilitaria para crear iconos de marcadores por categoría
const createCategoryIcon = (category) => {
  // Mapeo de colores por categoría
  const categoryColors = {
    'saneamiento': '#3b82f6',      // Azul
    'infraestructura': '#f59e0b',   // Amarillo
    'salud_publica': '#ef4444',     // Rojo
    'seguridad': '#8b5cf6',         // Púrpura
    'medio_ambiente': '#10b981',    // Verde
    'servicios_publicos': '#06b6d4', // Cyan
    'transporte': '#f97316',        // Naranja
    'otros': '#6b7280'              // Gris
  };
  
  const color = categoryColors[category] || categoryColors.otros;
  
  return L.divIcon({
    className: MAP_VIEW_CONFIG.marker.className,
    html: `
      <div class="marker-icon">
        <div class="marker-pin" style="background-color: ${color}; border: 3px solid white; border-radius: 50% 50% 50% 0; width: 20px; height: 20px; transform: rotate(-45deg); box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
      </div>
    `,
    iconSize: MAP_VIEW_CONFIG.marker.iconSize,
    iconAnchor: MAP_VIEW_CONFIG.marker.iconAnchor,
    popupAnchor: MAP_VIEW_CONFIG.marker.popupAnchor
  })
}

// Componente de advertencia de ubicación
const LocationWarning = memo(({ show, message }) => {
  if (!show || !message) return null

  return (
    <div className="location-warning" role="alert" aria-live="polite">
      <p>{message}</p>
    </div>
  )
})
LocationWarning.displayName = 'LocationWarning'

// Componente de error del mapa
const MapError = memo(({ error, onRetry }) => (
  <div className="map-error" role="alert">
    <AlertCircle size={24} aria-hidden="true" />
    <p>Error al cargar el mapa: {error}</p>
    <button onClick={onRetry} className="retry-button">
      Reintentar
    </button>
  </div>
))
MapError.displayName = 'MapError'
// Componente de popup del reporte optimizado
const ReportPopup = memo(({ report, showPopups }) => {
  if (!showPopups) return null

  const statusInfo = getStatusInfo(report.estado)
  const StatusIcon = statusInfo.icon
  const truncatedDescription = report.descripcion.length > MAP_VIEW_CONFIG.popup.descriptionLength
    ? `${report.descripcion.substring(0, MAP_VIEW_CONFIG.popup.descriptionLength)}...`
    : report.descripcion

  return (
    <Popup className={MAP_VIEW_CONFIG.popup.className}>
      <div className="map-popup-content">
        {/* Título y categoría del reporte */}
        <h3>{report.titulo}</h3>
        <CategoryBadge category={report.categoria} />
        {/* Descripción recortada */}
        <p>{truncatedDescription}</p>
        <div className="map-popup-footer">
          {/* Estado del reporte */}
          <span className={`status-badge ${statusInfo.className}`}>
            <StatusIcon size={14} aria-hidden="true" />
            {statusInfo.text}
          </span>
          {/* Enlace a detalles */}
          <Link
            to={`/reports/${report.id}`}
            className="map-popup-link"
            aria-label={`Ver detalles del reporte: ${report.titulo}`}
          >
            Ver detalles
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Popup>
  )
})
ReportPopup.displayName = 'ReportPopup'

// Componente principal optimizado
const MapView = memo(({ height = '500px', zoom = MAP_VIEW_CONFIG.defaultZoom, showPopups = true }) => {
  const { reports } = useReports()
  const { location, error: locationError } = useGeolocation()
  const [mapError, setMapError] = useState(null)
  const [mapCenter, setMapCenter] = useState(MAP_VIEW_CONFIG.defaultCenter)
  const [showLocationError, setShowLocationError] = useState(false)

  // Debug: Log reports data
  useEffect(() => {
    console.log('🗺️ MapView - Reports data:', reports)
    console.log('🗺️ MapView - Reports count:', reports?.length || 0)
    if (reports && reports.length > 0) {
      console.log('🗺️ MapView - First report sample:', {
        id: reports[0].id,
        titulo: reports[0].titulo,
        categoria: reports[0].categoria,
        latitud: reports[0].latitud,
        longitud: reports[0].longitud
      })
    }
  }, [reports])

  // Manejador optimizado para reintentar carga del mapa
  const handleRetry = useCallback(() => {
    window.location.reload()
  }, [])

  // Manejadores optimizados para eventos del mapa
  const handleMapReady = useCallback(() => {
    setMapError(null)
  }, [])

  const handleMapError = useCallback((error) => {
    setMapError(error.message)
  }, [])

  // Efecto para manejar la visibilidad del mensaje de error de ubicación
  useEffect(() => {
    if (locationError) {
      setShowLocationError(true)
      const timer = setTimeout(() => {
        setShowLocationError(false)
      }, MAP_VIEW_CONFIG.locationErrorTimeout)

      return () => clearTimeout(timer)
    }
  }, [locationError])

  // Efecto para establecer el centro del mapa basado en la ubicación del usuario
  useEffect(() => {
    if (location && isLocationInRegion(location)) {
      setMapCenter([location.latitude, location.longitude])
    }
  }, [location])

  // Memorizar iconos de marcadores para evitar recreación
  const categoryIcons = useMemo(() => {
    const icons = {}
    const categories = ['saneamiento', 'infraestructura', 'salud_publica', 'seguridad', 'medio_ambiente', 'servicios_publicos', 'transporte', 'otros']
    categories.forEach(category => {
      icons[category] = createCategoryIcon(category)
    })
    return icons
  }, [])

  // Función optimizada para obtener icono por categoría
  const getCategoryIcon = useCallback((category) => {
    console.log('MapView - Getting icon for category:', category)
    const icon = categoryIcons[category] || categoryIcons.otros
    return icon
  }, [categoryIcons])

  // Renderizado condicional para errores
  if (mapError) {
    return <MapError error={mapError} onRetry={handleRetry} />
  }

  return (
    <div
      className="map-container"
      style={{ height }}
      role="application"
      aria-label="Mapa de reportes ciudadanos"
    >
      {/* Advertencia de ubicación */}
      <LocationWarning show={showLocationError} message={locationError} />

      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%' }}
        whenReady={handleMapReady}
        whenError={handleMapError}
        aria-label="Mapa interactivo con reportes de la ciudad"
      >
        {/* Capa de mosaico de OpenStreetMap */}
        <TileLayer
          attribution={MAP_VIEW_CONFIG.tileLayer.attribution}
          url={MAP_VIEW_CONFIG.tileLayer.url}
        />

        {/* Marcadores de los reportes */}
        {reports && reports.length > 0 ? (
          reports.map(report => (
            <Marker
              key={report.id}
              position={[report.latitud, report.longitud]}
              icon={getCategoryIcon(report.categoria)}
            >
              <ReportPopup report={report} showPopups={showPopups} />
            </Marker>
          ))
        ) : (
          console.log('MapView - No reports to render') || null
        )}
      </MapContainer>
    </div>
  )
})

// Asignar nombre para el display name de React DevTools
MapView.displayName = 'MapView'
// PropTypes para los subcomponentes
LocationWarning.propTypes = {
  show: PropTypes.bool.isRequired,
  message: PropTypes.string
}

MapError.propTypes = {
  error: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired
}

ReportPopup.propTypes = {
  report: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    titulo: PropTypes.string.isRequired,
    categoria: PropTypes.string.isRequired,
    descripcion: PropTypes.string.isRequired,
    estado: PropTypes.string.isRequired
  }).isRequired,
  showPopups: PropTypes.bool.isRequired
}

// PropTypes para el componente principal
MapView.propTypes = {
  height: PropTypes.string,
  zoom: PropTypes.number,
  showPopups: PropTypes.bool
}

export default MapView
