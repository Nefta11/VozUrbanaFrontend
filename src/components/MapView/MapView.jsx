import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import { AlertCircle, Clock, CheckCircle, ChevronRight } from 'lucide-react'
import { useReports } from '../../hooks/useReports'
import { useGeolocation } from '../../hooks/useGeolocation'
import CategoryBadge from '../CategoryBadge/CategoryBadge'
import './MapView.css'
import PropTypes from 'prop-types'

const MapView = ({ height = '500px', zoom = 12, showPopups = true }) => {
  const { reports } = useReports()
  const { location, error: locationError } = useGeolocation()
  const [mapError, setMapError] = useState(null)
  const [mapCenter, setMapCenter] = useState([20.2745, -97.9557]) // Default to Xicotepec

  // Establece el centro del mapa basado en la ubicación del usuario si está dentro de la región
  useEffect(() => {
    if (location && location.latitude) {
      // Verifica si la ubicación está dentro de la región (aproximadamente)
      const isInRegion =
        location.latitude >= 20.1 &&
        location.latitude <= 20.4 &&
        location.longitude >= -98.1 &&
        location.longitude <= -97.9

      if (isInRegion) {
        setMapCenter([location.latitude, location.longitude])
      }
    }
  }, [location])

  // Iconos personalizados para los marcadores según la categoría del reporte
  const getCategoryIcon = (category) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-icon">
          <div class="marker-pin marker-${category}"></div>
        </div>
      `,
      iconSize: [40, 56],
      iconAnchor: [20, 56],
      popupAnchor: [0, -48]
    })
  }

  // Devuelve información del estado del reporte (texto e ícono)
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

  if (mapError) {
    return (
      <div className="map-error">
        {/* Error al cargar el mapa */}
        <p>Error al cargar el mapa: {mapError}</p>
      </div>
    )
  }

  if (locationError) {
    return (
      <div className="map-error">
        {/* Error al obtener la ubicación */}
        <p>{locationError}</p>
      </div>
    )
  }

  return (
    <div className="map-container" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%' }}
        whenReady={() => setMapError(null)}
        whenError={(error) => setMapError(error.message)}
      >
        {/* Capa de mosaico de OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marcadores de los reportes */}
        {reports.map(report => {
          const statusInfo = getStatusInfo(report.estado)
          const StatusIcon = statusInfo.icon

          return (
            <Marker
              key={report.id}
              position={[report.latitud, report.longitud]}
              icon={getCategoryIcon(report.categoria)}
            >
              {showPopups && (
                <Popup className="map-popup">
                  <div className="map-popup-content">
                    {/* Título y categoría del reporte */}
                    <h3>{report.titulo}</h3>
                    <CategoryBadge category={report.categoria} />
                    {/* Descripción recortada */}
                    <p>{report.descripcion.substring(0, 100)}...</p>
                    <div className="map-popup-footer">
                      {/* Estado del reporte */}
                      <span className={`status-badge status-${report.estado}`}>
                        <StatusIcon size={14} />
                        {statusInfo.text}
                      </span>
                      {/* Enlace a detalles */}
                      <Link to={`/reports/${report.id}`} className="map-popup-link">
                        Ver detalles
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                </Popup>
              )}
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
MapView.propTypes = {
  height: PropTypes.string,
  zoom: PropTypes.number,
  showPopups: PropTypes.bool
}

export default MapView
