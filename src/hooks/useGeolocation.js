import { useState, useEffect } from 'react'

export const useGeolocation = () => {
  const [location, setLocation] = useState({
    latitude: 20.2745,  // Default to Xicotepec
    longitude: -97.9557
  })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    if (!navigator.geolocation) {
      setError('La geolocalización no está soportada por su navegador')
      setIsLoading(false)
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (isMounted) {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
          setIsLoading(false)
        }
      },
      (error) => {
        if (!isMounted) return

        let errorMessage = 'No se pudo obtener su ubicación'
        
        if (error.code === 1) { // GeolocationPositionError.PERMISSION_DENIED
          errorMessage = 'Acceso a la ubicación denegado. Para una mejor experiencia, por favor habilite los permisos de ubicación en la configuración de su navegador.'
        } else if (error.code === 2) { // GeolocationPositionError.POSITION_UNAVAILABLE
          errorMessage = 'No se pudo determinar su ubicación. Por favor, inténtelo de nuevo.'
        } else if (error.code === 3) { // GeolocationPositionError.TIMEOUT
          errorMessage = 'Se agotó el tiempo para obtener su ubicación. Por favor, inténtelo de nuevo.'
        }
        
        setError(errorMessage)
        console.warn('Error getting location:', errorMessage)
        setIsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )

    return () => {
      isMounted = false
    }
  }, [])

  return { location, error, isLoading }
}