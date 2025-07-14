import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import PropTypes from 'prop-types'
import './MapPicker.css'

const LocationMarker = ({ position, setPosition, onLocationSelect, setHasUserSelected }) => {
  useMapEvents({
    click(e) {
      const newPosition = e.latlng
      setPosition(newPosition)
      setHasUserSelected(true) // Mark that user has manually selected a position
      
      // Attempt to get address from coordinates
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPosition.lat}&lon=${newPosition.lng}`)
        .then(response => response.json())
        .then(data => {
          const address = data.display_name || `${newPosition.lat.toFixed(6)}, ${newPosition.lng.toFixed(6)}`
          onLocationSelect(newPosition.lat, newPosition.lng, address)
        })
        .catch(() => {
          // If geocoding fails, use coordinates as address
          onLocationSelect(newPosition.lat, newPosition.lng, `${newPosition.lat.toFixed(6)}, ${newPosition.lng.toFixed(6)}`)
        })
    }
  })

  // Custom marker icon
  const markerIcon = L.divIcon({
    className: 'picker-marker',
    html: `
      <div class="picker-marker-icon">
        <div class="picker-marker-pin"></div>
      </div>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42]
  })

  return position === null ? null : (
    <Marker position={position} icon={markerIcon} />
  )
}

const MapPicker = ({ initialPosition, onLocationSelect }) => {
  const [position, setPosition] = useState(null)
  const [mapCenter, setMapCenter] = useState([20.2745, -97.9557]) // Default to Xicotepec
  const [hasUserSelected, setHasUserSelected] = useState(false) // Track if user has manually selected a position
  
  useEffect(() => {
    // Only update position if user hasn't manually selected one
    if (initialPosition && initialPosition[0] && initialPosition[1] && !hasUserSelected) {
      const newPosition = { lat: initialPosition[0], lng: initialPosition[1] }
      setPosition(newPosition)
      setMapCenter([initialPosition[0], initialPosition[1]])
    }
  }, [initialPosition, hasUserSelected])
  
  const handlePositionChange = (lat, lng, address) => {
    onLocationSelect(lat, lng, address)
  }
  
  return (
    <div className="map-picker">
      <div className="map-instructions">
        <div className="instruction-content">
          <span className="instruction-icon">📍</span>
          Haz clic en el mapa para seleccionar la ubicación exacta
        </div>
      </div>
      
      <MapContainer 
        center={mapCenter}
        zoom={12} 
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
}
LocationMarker.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  }),
  setPosition: PropTypes.func.isRequired,
  onLocationSelect: PropTypes.func.isRequired,
  setHasUserSelected: PropTypes.func.isRequired
}

MapPicker.propTypes = {
  initialPosition: PropTypes.arrayOf(PropTypes.number),
  onLocationSelect: PropTypes.func.isRequired
}

export default MapPicker