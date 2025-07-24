import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Loader,
  Droplets,
  Construction,
  Heart,
  Shield,
  Leaf,
  Zap,
  Bus,
  AlertCircle,
  Trash2
} from 'lucide-react'
import { useReports } from '../../hooks/useReports'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'

// Función utilitaria para geocodificación reversa
const getAddressFromCoordinates = async (lat, lng) => {
  try {
    console.log('🔍 Geocodificando en CreateReport:', lat, lng)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    )
    const data = await response.json()
    const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    console.log('🔍 Dirección encontrada en CreateReport:', address)
    return address
  } catch (error) {
    console.warn('Error en geocodificación:', error)
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }
}
import { useGeolocation } from '../../hooks/useGeolocation'
import MapPicker from '../../components/MapPicker/MapPicker'
import './CreateReport.css'

const CreateReport = () => {
  const { createReport, categories } = useReports()
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const { location } = useGeolocation()
  const navigate = useNavigate()

  // Mapeo de iconos para las categorías
  const iconMap = {
    'Droplets': Droplets,
    'Construction': Construction,
    'Heart': Heart,
    'Shield': Shield,
    'Leaf': Leaf,
    'Zap': Zap,
    'Bus': Bus,
    'AlertCircle': AlertCircle,
    'Trash2': Trash2,
    // Fallbacks para compatibilidad
    'Road': Construction
  }

  const getCategoryIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || AlertCircle
    return IconComponent
  }

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reportData, setReportData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    prioridad: 'media',
    ubicacion: '',
    latitud: location?.latitude || 20.2745,
    longitud: location?.longitude || -97.9557,
    estado: 'nuevo',
    imagen: '',
    usuario: {
      id: user?.id,
      nombre: user?.nombre
    }
  })
  const [formErrors, setFormErrors] = useState({})
  const [hasUserSelectedLocation, setHasUserSelectedLocation] = useState(false) // Rastrear si el usuario seleccionó ubicación manualmente

  // Efecto para actualizar la ubicación inicial cuando se obtiene la geolocalización SOLO la primera vez
  useEffect(() => {
    // Solo actualizar si el usuario no ha seleccionado manualmente una ubicación Y no hay datos previos
    if (location?.latitude && location?.longitude && !hasUserSelectedLocation && !reportData.ubicacion) {
      console.log('🌍 Inicializando ubicación solo por primera vez:', location)
      // Obtener dirección de las coordenadas iniciales
      getAddressFromCoordinates(location.latitude, location.longitude)
        .then(address => {
          console.log('🏠 Dirección obtenida para inicialización:', address)
          setReportData(prev => ({
            ...prev,
            latitud: location.latitude,
            longitud: location.longitude,
            ubicacion: address
          }))
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.latitude, location?.longitude]) // Solo depender de las coordenadas para evitar loops infinitos

  const updateReportData = (field, value) => {
    setReportData({
      ...reportData,
      [field]: value
    })

    // Si el usuario edita manualmente la ubicación, marcar que ha seleccionado
    if (field === 'ubicacion' && value.trim()) {
      setHasUserSelectedLocation(true)
    }

    // Clear error for this field if any
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: null
      })
    }
  }

  const validateStep = (step) => {
    let isValid = true
    const errors = {}

    if (step === 1) {
      if (!reportData.titulo.trim()) {
        errors.titulo = 'El título es obligatorio'
        isValid = false
      }

      if (!reportData.descripcion.trim()) {
        errors.descripcion = 'La descripción es obligatoria'
        isValid = false
      }
    }

    if (step === 2) {
      if (!reportData.categoria) {
        errors.categoria = 'Debe seleccionar una categoría'
        isValid = false
      }
    }

    if (step === 3) {
      if (!reportData.ubicacion.trim()) {
        errors.ubicacion = 'La ubicación es obligatoria'
        isValid = false
      }
    }

    setFormErrors(errors)
    return isValid
  }

  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1)
    window.scrollTo(0, 0)
  }

  const handleMapLocationSelect = async (lat, lng, address) => {
    console.log('📍 Usuario seleccionó ubicación en mapa:', { lat, lng, address })

    // Marcar inmediatamente que el usuario seleccionó manualmente
    setHasUserSelectedLocation(true)

    // Actualizar coordenadas inmediatamente
    console.log('📍 Actualizando coordenadas:', lat, lng)
    setReportData(prev => ({
      ...prev,
      latitud: lat,
      longitud: lng
    }))

    // Si tenemos una dirección válida (no solo coordenadas), úsala
    if (address && address !== `${lat.toFixed(6)}, ${lng.toFixed(6)}`) {
      console.log('📍 Usando dirección recibida:', address)
      setReportData(prev => ({
        ...prev,
        ubicacion: address
      }))
    } else {
      // Si no hay dirección válida, obtenerla
      console.log('🔍 Obteniendo dirección para las coordenadas...')
      try {
        const fetchedAddress = await getAddressFromCoordinates(lat, lng)
        console.log('🔍 Dirección obtenida:', fetchedAddress)
        setReportData(prev => ({
          ...prev,
          ubicacion: fetchedAddress
        }))
      } catch (error) {
        console.error('Error obteniendo dirección:', error)
        setReportData(prev => ({
          ...prev,
          ubicacion: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep(currentStep)) {
      return
    }

    setIsSubmitting(true)

    try {
      const newReport = await createReport(reportData)
      showNotification('Reporte creado exitosamente', 'success')
      navigate(`/reports/${newReport.id}`)
    } catch {
      showNotification('Error al crear el reporte', 'error')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="create-report-page">
      <div className="container">
        <div className="page-header">
          <h1>Crear Nuevo Reporte</h1>
          <p>Contribuye a mejorar tu comunidad reportando problemas</p>
        </div>

        <div className="form-container">
          <div className="progress-bar">
            <div className="progress-steps">
              <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-label">Información</div>
              </div>
              <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">Categoría</div>
              </div>
              <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-label">Ubicación</div>
              </div>
              <div className={`progress-step ${currentStep >= 4 ? 'active' : ''}`}>
                <div className="step-number">4</div>
                <div className="step-label">Revisar</div>
              </div>
            </div>
          </div>

          <form className="report-form" onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="form-step">
                <h2>Información Básica</h2>
                <p className="step-description">Proporciona los detalles principales del problema</p>

                <div className="form-group">
                  <label htmlFor="titulo">Título*</label>
                  <input
                    type="text"
                    id="titulo"
                    value={reportData.titulo}
                    onChange={(e) => updateReportData('titulo', e.target.value)}
                    placeholder="Ej: Fuga de agua en Av. Principal"
                    className={formErrors.titulo ? 'input-error' : ''}
                  />
                  {formErrors.titulo && (
                    <span className="error-message">{formErrors.titulo}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="descripcion">Descripción*</label>
                  <textarea
                    id="descripcion"
                    value={reportData.descripcion}
                    onChange={(e) => updateReportData('descripcion', e.target.value)}
                    placeholder="Describe detalladamente el problema..."
                    rows="5"
                    className={formErrors.descripcion ? 'input-error' : ''}
                  ></textarea>
                  {formErrors.descripcion && (
                    <span className="error-message">{formErrors.descripcion}</span>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="button-next"
                    onClick={goToNextStep}
                  >
                    Siguiente
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Category and Priority */}
            {currentStep === 2 && (
              <div className="form-step">
                <h2>Categoría y Prioridad</h2>
                <p className="step-description">Clasifica el tipo de problema y su nivel de urgencia</p>

                <div className="form-group">
                  <label>Categoría*</label>
                  <div className="category-selection">
                    {categories.map(category => {
                      const IconComponent = getCategoryIcon(category.icono)
                      return (
                        <div
                          key={category.id}
                          className={`category-option ${reportData.categoria === category.id ? 'selected' : ''}`}
                          onClick={() => updateReportData('categoria', category.id)}
                        >
                          <div className="category-icon">
                            <IconComponent size={24} />
                          </div>
                          <div className="category-name">{category.nombre}</div>
                          <div className="category-description">{category.descripcion}</div>
                        </div>
                      )
                    })}
                  </div>
                  {formErrors.categoria && (
                    <span className="error-message">{formErrors.categoria}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="prioridad">Prioridad</label>
                  <div className="priority-selection">
                    <div
                      className={`priority-option ${reportData.prioridad === 'baja' ? 'selected' : ''}`}
                      onClick={() => updateReportData('prioridad', 'baja')}
                    >
                      <div className="priority-color priority-low"></div>
                      <div className="priority-name">Baja</div>
                    </div>
                    <div
                      className={`priority-option ${reportData.prioridad === 'media' ? 'selected' : ''}`}
                      onClick={() => updateReportData('prioridad', 'media')}
                    >
                      <div className="priority-color priority-medium"></div>
                      <div className="priority-name">Media</div>
                    </div>
                    <div
                      className={`priority-option ${reportData.prioridad === 'alta' ? 'selected' : ''}`}
                      onClick={() => updateReportData('prioridad', 'alta')}
                    >
                      <div className="priority-color priority-high"></div>
                      <div className="priority-name">Alta</div>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="button-back"
                    onClick={goToPreviousStep}
                  >
                    <ChevronLeft size={18} />
                    Anterior
                  </button>
                  <button
                    type="button"
                    className="button-next"
                    onClick={goToNextStep}
                  >
                    Siguiente
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {currentStep === 3 && (
              <div className="form-step">
                <h2>Ubicación</h2>
                <p className="step-description">Indica dónde se encuentra el problema</p>

                <div className="form-group">
                  <label htmlFor="ubicacion">Dirección*</label>
                  <input
                    type="text"
                    id="ubicacion"
                    value={reportData.ubicacion}
                    onChange={(e) => updateReportData('ubicacion', e.target.value)}
                    placeholder="Ej: Av. Principal y Calle 5"
                    className={formErrors.ubicacion ? 'input-error' : ''}
                  />
                  {formErrors.ubicacion && (
                    <span className="error-message">{formErrors.ubicacion}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Selecciona en el mapa</label>
                  <div className="map-picker-container">
                    <MapPicker
                      initialPosition={hasUserSelectedLocation ? [reportData.latitud, reportData.longitud] : [location?.latitude || 20.2745, location?.longitude || -97.9557]}
                      onLocationSelect={handleMapLocationSelect}
                      autoInitialize={false}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="imagen">URL de Imagen (opcional)</label>
                  <input
                    type="text"
                    id="imagen"
                    value={reportData.imagen}
                    onChange={(e) => updateReportData('imagen', e.target.value)}
                    placeholder="URL de una imagen del problema"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="button-back"
                    onClick={goToPreviousStep}
                  >
                    <ChevronLeft size={18} />
                    Anterior
                  </button>
                  <button
                    type="button"
                    className="button-next"
                    onClick={goToNextStep}
                  >
                    Siguiente
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review and Submit */}
            {currentStep === 4 && (
              <div className="form-step">
                <h2>Revisar y Enviar</h2>
                <p className="step-description">Verifica la información antes de enviar el reporte</p>

                <div className="report-preview">
                  <div className="preview-section">
                    <h3>Información Básica</h3>
                    <div className="preview-field">
                      <span className="field-label">Título:</span>
                      <span className="field-value">{reportData.titulo}</span>
                    </div>
                    <div className="preview-field">
                      <span className="field-label">Descripción:</span>
                      <span className="field-value description">{reportData.descripcion}</span>
                    </div>
                  </div>

                  <div className="preview-section">
                    <h3>Categoría y Prioridad</h3>
                    <div className="preview-field">
                      <span className="field-label">Categoría:</span>
                      <span className="field-value">
                        {categories.find(c => c.id === reportData.categoria)?.nombre || ''}
                      </span>
                    </div>
                    <div className="preview-field">
                      <span className="field-label">Prioridad:</span>
                      <span className="field-value">
                        <span className={`priority-indicator priority-${reportData.prioridad}`}></span>
                        {reportData.prioridad.charAt(0).toUpperCase() + reportData.prioridad.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="preview-section">
                    <h3>Ubicación</h3>
                    <div className="preview-field">
                      <span className="field-label">Dirección:</span>
                      <span className="field-value">{reportData.ubicacion}</span>
                    </div>
                    <div className="preview-field">
                      <span className="field-label">Coordenadas:</span>
                      <span className="field-value">
                        {reportData.latitud.toFixed(6)}, {reportData.longitud.toFixed(6)}
                      </span>
                    </div>
                  </div>

                  {reportData.imagen && (
                    <div className="preview-section">
                      <h3>Imagen</h3>
                      <div className="preview-image">
                        <img src={reportData.imagen} alt="Vista previa" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="button-back"
                    onClick={goToPreviousStep}
                    disabled={isSubmitting}
                  >
                    <ChevronLeft size={18} />
                    Anterior
                  </button>
                  <button
                    type="submit"
                    className="button-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader size={18} className="spinner" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Enviar Reporte
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateReport