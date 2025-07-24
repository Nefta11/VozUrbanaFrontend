import { useEffect, useState, memo, useCallback, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import PropTypes from 'prop-types'
import './MapPicker.css'

// Configuración externa para evitar recreación en cada render
const MAP_CONFIG = {
  defaultCenter: [20.2745, -97.9557], // Xicotepec por defecto
  defaultZoom: 12,
  tileLayer: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  geocoding: {
    baseUrl: 'https://nominatim.openstreetmap.org/reverse',
    format: 'json'
  },
  marker: {
    icon: {
      className: 'picker-marker',
      iconSize: [30, 42],
      iconAnchor: [15, 42]
    }
  },
  instruction: {
    icon: '📍',
    text: 'Haz clic en el mapa para seleccionar la ubicación exacta'
  }
}

// Función utilitaria para geocodificación reversa
const getAddressFromCoordinates = async (lat, lng) => {
  try {
    console.log('🔍 Geocodificando:', lat, lng)
    const response = await fetch(
      `${MAP_CONFIG.geocoding.baseUrl}?format=${MAP_CONFIG.geocoding.format}&lat=${lat}&lon=${lng}`
    )
    const data = await response.json()
    const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    console.log('🔍 Dirección encontrada:', address)
    return address
  } catch (error) {
    console.warn('Error en geocodificación:', error)
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }
}

// Componente optimizado para el marcador de ubicación
const LocationMarker = memo(({ position, setPosition, onLocationSelect, setHasUserSelected }) => {
  // Manejador optimizado para clics en el mapa
  const handleMapClick = useCallback(async (e) => {
    const newPosition = e.latlng
    setPosition(newPosition)
    setHasUserSelected(true) // Marcar que el usuario seleccionó manualmente

    // Obtener dirección de las coordenadas
    const address = await getAddressFromCoordinates(newPosition.lat, newPosition.lng)
    onLocationSelect(newPosition.lat, newPosition.lng, address)
  }, [setPosition, setHasUserSelected, onLocationSelect])

  // Configurar eventos del mapa
  useMapEvents({
    click: handleMapClick
  })

  // Icono personalizado del marcador (memorizado para evitar recreación)
  const markerIcon = useMemo(() => L.divIcon({
    className: MAP_CONFIG.marker.icon.className,
    html: `
      <div class="picker-marker-icon">
        <div class="picker-marker-pin"></div>
      </div>
    `,
    iconSize: MAP_CONFIG.marker.icon.iconSize,
    iconAnchor: MAP_CONFIG.marker.icon.iconAnchor
  }), [])

  return position === null ? null : (
    <Marker position={position} icon={markerIcon} />
  )
})

// Asignar nombre para el display name de React DevTools
LocationMarker.displayName = 'LocationMarker'

// Componente de instrucciones del mapa
const MapInstructions = memo(() => (
  <div className="map-instructions" role="banner" aria-label="Instrucciones del mapa">
    <div className="instruction-content">
      <span className="instruction-icon" aria-hidden="true">{MAP_CONFIG.instruction.icon}</span>
      <span>{MAP_CONFIG.instruction.text}</span>
    </div>
  </div>
))
MapInstructions.displayName = 'MapInstructions'

// Componente principal 
const MapPicker = memo(({ initialPosition, onLocationSelect }) => {
  const [position, setPosition] = useState(null)
  const [mapCenter, setMapCenter] = useState(MAP_CONFIG.defaultCenter)
  const [hasUserSelected, setHasUserSelected] = useState(false) // Rastrear selección manual del usuario
  const [hasInitialized, setHasInitialized] = useState(false) // Rastrear si ya se inicializó

  // Efecto para actualizar posición inicial
  useEffect(() => {
    // Solo actualizar posición si el usuario no ha seleccionado manualmente y no se ha inicializado
    if (initialPosition && initialPosition[0] && initialPosition[1] && !hasUserSelected && !hasInitialized) {
      const newPosition = { lat: initialPosition[0], lng: initialPosition[1] }
      setPosition(newPosition)
      setMapCenter([initialPosition[0], initialPosition[1]])
      
      // Obtener dirección inicial si no se ha proporcionado
      const initializeAddress = async () => {
        console.log('🗺️ MapPicker - Inicializando dirección para:', initialPosition)
        const address = await getAddressFromCoordinates(initialPosition[0], initialPosition[1])
        console.log('🗺️ MapPicker - Dirección obtenida:', address)
        onLocationSelect(initialPosition[0], initialPosition[1], address)
        setHasInitialized(true)
      }
      
      initializeAddress()
    }
  }, [initialPosition, hasUserSelected, hasInitialized, onLocationSelect])

  // Manejador optimizado para cambio de posición
  const handlePositionChange = useCallback((lat, lng, address) => {
    onLocationSelect(lat, lng, address)
  }, [onLocationSelect])

  return (
    <div className="map-picker" role="application" aria-label="Selector de ubicación en mapa">
      <MapInstructions />

      <MapContainer
        center={mapCenter}
        zoom={MAP_CONFIG.defaultZoom}
        scrollWheelZoom={true}
        aria-label="Mapa interactivo para seleccionar ubicación"
      >
        <TileLayer
          attribution={MAP_CONFIG.tileLayer.attribution}
          url={MAP_CONFIG.tileLayer.url}
        />
        <LocationMarker
          position={position}
          setPosition={setPosition}
          onLocationSelect={handlePositionChange}
          setHasUserSelected={setHasUserSelected}
        />
      </MapContainer>
    </div>
  )
})

// Asignar nombre para el display name de React DevTools
MapPicker.displayName = 'MapPicker'
// PropTypes para LocationMarker
LocationMarker.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired
  }),
  setPosition: PropTypes.func.isRequired,
  onLocationSelect: PropTypes.func.isRequired,
  setHasUserSelected: PropTypes.func.isRequired
}

// PropTypes para MapPicker  
MapPicker.propTypes = {
  initialPosition: PropTypes.arrayOf(PropTypes.number),
  onLocationSelect: PropTypes.func.isRequired
}

export default MapPicker