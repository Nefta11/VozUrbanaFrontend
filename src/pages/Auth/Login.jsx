import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogIn, Loader, AlertCircle, UserX } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
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
  // Eliminado: sección de cuentas de prueba

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
        showNotification(`¡Bienvenido ${user.nombre}!`, 'success')
        setTimeout(() => {
          navigate(from, { replace: true })
        }, 1000) // Pequeño delay para que se vea la notificación
      } else {
        showNotification('Credenciales inválidas', 'error')
        setErrors({ general: 'Credenciales inválidas' })
      }
    } catch (error) {
      showNotification(error.message || 'Error al iniciar sesión', 'error')
      setErrors({ general: error.message || 'Error al iniciar sesión' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestMode = () => {
    showNotification('Entrando en modo invitado', 'info')
    navigate('/')
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-form-container">
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

            <button
              type="button"
              className="auth-button-secondary"
              onClick={handleGuestMode}
            >
              <UserX size={20} />
              Entrar en modo invitado
            </button>

            <div className="auth-footer">
              <p>¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link></p>
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
    </div>
  )
}

export default Login