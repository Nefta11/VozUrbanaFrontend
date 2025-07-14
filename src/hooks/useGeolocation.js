import { useState, useEffect } from 'react'

export const useGeolocation = () => {
  const [location, setLocation] = useState({
    latitude: 20.2745,  // Default en Xicotepec
    longitude: -97.9557
  })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const getCurrentLocation = () => {
    setIsLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('La geolocalización no está soportada por su navegador')
      setIsLoading(false)
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
        setIsLoading(false)
        setError(null)
      },
      (error) => {
        let errorMessage = 'No se pudo obtener su ubicación'
        
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = 'Acceso a la ubicación denegado. Se usará la ubicación por defecto.'
            break
          case 2: // POSITION_UNAVAILABLE
            errorMessage = 'Ubicación no disponible. Se usará la ubicación por defecto.'
            break
          case 3: // TIMEOUT
            errorMessage = 'Tiempo agotado para obtener ubicación. Se usará la ubicación por defecto.'
            break
          default:
            errorMessage = 'Error desconocido. Se usará la ubicación por defecto.'
        }
        
        console.warn('Geolocation error:', error)
        setError(errorMessage)
        setIsLoading(false)
        // No cambiar la ubicación por defecto en caso de error
      },
      { 
        enableHighAccuracy: false, // Cambio a false para mejor compatibilidad
        timeout: 10000, // Aumentar timeout
        maximumAge: 300000 // 5 minutos de cache
      }
    )
  }

  useEffect(() => {
    getCurrentLocation()
  }, [])

  return { 
    location, 
    error, 
    isLoading,
    retry: getCurrentLocation 
  }
}