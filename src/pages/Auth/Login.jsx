import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, LogIn, Loader, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import AlertModal from '../../components/AlertModal/AlertModal'
import './Auth.css'

const Login = () => {
  const { login } = useAuth()
  const { showNotification } = useNotification()
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const from = location.state?.from?.pathname || "/"

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

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria'
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
      const user = await login(formData.email, formData.password)

      if (user) {
        setShowSuccessModal(true)
      } else {
        setErrors({ general: 'Credenciales inválidas' })
      }
    } catch (error) {
      setErrors({ general: error.message || 'Error al iniciar sesión' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>¡Bienvenido de nuevo!</h1>
          <p>Inicia sesión para acceder a tu cuenta y gestionar tus reportes</p>
        </div>

        {errors.general && (
          <div className="auth-error">
            <AlertCircle size={18} />
            {errors.general}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              <Mail size={18} />
              Correo Electrónico
            </label>
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
            <label htmlFor="password">
              <Lock size={18} />
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => updateFormData('password', e.target.value)}
              placeholder="Tu contraseña"
              className={errors.password ? 'input-error' : ''}
              autoComplete="current-password"
            />
            {errors.password && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.password}
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
                Iniciando sesión...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link></p>
        </div>

        <div className="auth-divider">O prueba con una cuenta de demostración</div>

        <div className="test-accounts">
          <h3>Cuentas de prueba disponibles:</h3>
          <ul>
            <li>
              <strong>Ciudadano:</strong> maria@email.com / password123
            </li>
            <li>
              <strong>Ciudadano:</strong> carlos@email.com / password123
            </li>
            <li>
              <strong>Administrador:</strong> admin@vozurbana.com / admin123
            </li>
          </ul>
        </div>
      </div>

      <AlertModal
        isOpen={showSuccessModal}
        type="success"
        title="¡Bienvenido de nuevo!"
        message="Has iniciado sesión correctamente. ¡Gracias por ser parte de Voz Urbana!"
        primaryAction={{
          label: 'Continuar',
          onClick: () => {
            setShowSuccessModal(false)
            showNotification('Inicio de sesión exitoso', 'success')
            navigate(from, { replace: true })
          }
        }}
      />
    </div>
  )
}

export default Login