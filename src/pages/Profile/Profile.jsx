import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, Calendar, FileText, Settings, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '../../hooks/useAuth'
import { useReports } from '../../hooks/useReports'
import ReportCard from '../../components/ReportCard/ReportCard'
import './Profile.css'

const Profile = () => {
  const { user } = useAuth()
  const { getReportsByUser } = useReports()
  
  const [userReports, setUserReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('reportes')
  
  useEffect(() => {
    const fetchUserReports = async () => {
      if (user && user.id) {
        setIsLoading(true)
        try {
          const reports = await getReportsByUser(user.id)
          setUserReports(reports)
        } catch (error) {
          console.error('Error fetching user reports:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    fetchUserReports()
  }, [user, getReportsByUser])
  
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: es })
    } catch (error) {
      return dateString
    }
  }
  
  const getReportStats = () => {
    if (!userReports.length) return { total: 0, nuevo: 0, en_proceso: 0, resuelto: 0 }
    
    return {
      total: userReports.length,
      nuevo: userReports.filter(r => r.estado === 'nuevo').length,
      en_proceso: userReports.filter(r => r.estado === 'en_proceso').length,
      resuelto: userReports.filter(r => r.estado === 'resuelto').length
    }
  }
  
  const stats = getReportStats()
  
  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading"></div>
      </div>
    )
  }
  
  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-info">
            <div className="profile-avatar">
              <User size={60} />
            </div>
            <div className="profile-details">
              <h1>{user.nombre}</h1>
              <div className="profile-meta">
                <span className="profile-email">
                  <User size={16} />
                  {user.email}
                </span>
                <span className="profile-date">
                  <Calendar size={16} />
                  Miembro desde {formatDate(user.fecha_registro)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="profile-actions">
            <Link to="/create-report" className="profile-action-button">
              Crear Reporte
            </Link>
          </div>
        </div>
        
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Reportes</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.nuevo}</div>
            <div className="stat-label">Nuevos</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.en_proceso}</div>
            <div className="stat-label">En Proceso</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.resuelto}</div>
            <div className="stat-label">Resueltos</div>
          </div>
        </div>
        
        <div className="profile-tabs">
          <button 
            className={`profile-tab ${activeTab === 'reportes' ? 'active' : ''}`}
            onClick={() => setActiveTab('reportes')}
          >
            <FileText size={18} />
            Mis Reportes
          </button>
          <button 
            className={`profile-tab ${activeTab === 'configuracion' ? 'active' : ''}`}
            onClick={() => setActiveTab('configuracion')}
          >
            <Settings size={18} />
            Configuración
          </button>
        </div>
        
        <div className="profile-content">
          {activeTab === 'reportes' && (
            <>
              {isLoading ? (
                <div className="loading-container">
                  <div className="loading"></div>
                </div>
              ) : userReports.length === 0 ? (
                <div className="no-reports">
                  <h3>No has creado reportes aún</h3>
                  <p>Ayuda a mejorar tu comunidad creando tu primer reporte</p>
                  <Link to="/create-report" className="create-report-button">
                    Crear Reporte
                    <ChevronRight size={18} />
                  </Link>
                </div>
              ) : (
                <div className="reports-grid">
                  {userReports.map(report => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </div>
              )}
            </>
          )}
          
          {activeTab === 'configuracion' && (
            <div className="profile-settings">
              <div className="settings-card">
                <h2>Configuración de Cuenta</h2>
                <p className="coming-soon">Próximamente: Opciones para editar tu perfil y cambiar tu contraseña.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile