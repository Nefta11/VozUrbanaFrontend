import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Loader, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import AlertModal from '../../components/AlertModal/AlertModal'
import './Auth.css'

const Register = () => {
  const { register } = useAuth()
  const { showNotification } = useNotification()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const updateFormData = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    })

    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const userData = {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password
      }

      const user = await register(userData)

      if (user) {
        setShowSuccessModal(true)
      } else {
        setErrors({ general: 'Error al registrarse' })
      }
    } catch (error) {
      setErrors({ general: error.message || 'Error al registrarse' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-form-container">
            <div className="auth-header">
              <h1>Crear Cuenta</h1>
              <p>Únete a Voz Urbana y ayuda a mejorar tu comunidad</p>
            </div>

            {errors.general && (
              <div className="auth-error">
                <AlertCircle size={18} />
                {errors.general}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre Completo</label>
                <input
                  type="text"
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => updateFormData('nombre', e.target.value)}
                  placeholder="Tu nombre completo"
                  className={errors.nombre ? 'input-error' : ''}
                  autoComplete="name"
                />
                {errors.nombre && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {errors.nombre}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="tu@email.com"
                  className={errors.email ? 'input-error' : ''}
                  autoComplete="email"
                />
                {errors.email && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className={errors.password ? 'input-error' : ''}
                  autoComplete="new-password"
                />
                {errors.password && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {errors.password}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  placeholder="Repite tu contraseña"
                  className={errors.confirmPassword ? 'input-error' : ''}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader size={20} className="spinner" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Crear Cuenta
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link></p>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-right-content">
            <div className="auth-brand">
              <img src="/src/assets/logoVozUrbana.png" alt="Voz Urbana" />
              <h2>VOZ URBANA</h2>
            </div>
            <h3>CONECTA. REPORTA. TRANSFORMA.</h3>
            <p>Tu voz cuenta para hacer de tu ciudad un lugar mejor para todos.</p>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={showSuccessModal}
        type="success"
        title="¡Registro Exitoso!"
        message="Tu cuenta ha sido creada correctamente. ¡Bienvenido a Voz Urbana!"
        primaryAction={{
          label: 'Comenzar',
          onClick: () => {
            setShowSuccessModal(false)
            showNotification('Cuenta creada exitosamente', 'success')
            navigate('/')
          }
        }}
      />
    </div>
  )
}

export default Register