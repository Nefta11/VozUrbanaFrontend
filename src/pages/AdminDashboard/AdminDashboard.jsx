import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Clock,
  CheckCircle,
  Users,
  FileText,
  AlertTriangle,
  Loader,
  XCircle
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useReports } from '../../hooks/useReports'
import { useNotification } from '../../hooks/useNotification'
import ReportCard from '../../components/ReportCard/ReportCard'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth()
  const { reports, updateStatusAdmin } = useReports()
  const { showNotification } = useNotification()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('nuevo')
  const [filteredReports, setFilteredReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingReportId, setUpdatingReportId] = useState(null)

  useEffect(() => {
    if (!isAdmin) {
      showNotification('Acceso denegado. Solo administradores.', 'error')
      navigate('/')
    }
  }, [isAdmin, navigate, showNotification])

  useEffect(() => {
    // Si reports está vacío, mostrar loader hasta que lleguen datos
    if (reports.length === 0) {
      setIsLoading(true)
      setFilteredReports([])
    } else {
      const filtered = reports.filter(report => report.estado === activeTab)
      setFilteredReports(filtered)
      setIsLoading(false)
    }
  }, [activeTab, reports])

  const getStats = () => {
    return {
      total: reports.length,
      nuevos: reports.filter(r => r.estado === 'nuevo').length,
      en_proceso: reports.filter(r => r.estado === 'en_proceso').length,
      resueltos: reports.filter(r => r.estado === 'resuelto').length,
      cerrados: reports.filter(r => r.estado === 'cerrado').length
    }
  }

  const stats = getStats()

  const handleStatusChange = async (reportId, newStatus) => {
    setUpdatingReportId(reportId)
    try {
      await updateStatusAdmin(reportId, newStatus)
      showNotification('Estado actualizado correctamente', 'success')
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      showNotification(
        error?.message || 'Error al actualizar el estado',
        'error'
      )
    } finally {
      setUpdatingReportId(null)
    }
  }

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      nuevo: 'en_proceso',
      en_proceso: 'resuelto',
      resuelto: 'cerrado'
    }
    return statusFlow[currentStatus] || currentStatus
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Panel de Administración</h1>
            <p>Gestiona y da seguimiento a los reportes ciudadanos</p>
          </div>

          <div className="admin-info">
            <div className="admin-avatar">
              <Users size={24} />
            </div>
            <div className="admin-details">
              <span className="admin-name">{user?.nombre}</span>
              <span className="admin-role">Administrador</span>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <FileText size={24} />
            </div>
            <div className="stat-content">
              <h3>Total Reportes</h3>
              <p className="stat-number">{stats.total}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon nuevos">
              <AlertCircle size={24} />
            </div>
            <div className="stat-content">
              <h3>Nuevos</h3>
              <p className="stat-number">{stats.nuevos}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon en-proceso">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3>En Proceso</h3>
              <p className="stat-number">{stats.en_proceso}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon resueltos">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <h3>Resueltos</h3>
              <p className="stat-number">{stats.resueltos}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon cerrados">
              <XCircle size={24} />
            </div>
            <div className="stat-content">
              <h3>Cerrados</h3>
              <p className="stat-number">{stats.cerrados}</p>
            </div>
          </div>
        </div>

        <div className="reports-section">
          <div className="reports-tabs">
            <button
              className={`tab-button ${activeTab === 'nuevo' ? 'active' : ''}`}
              onClick={() => setActiveTab('nuevo')}
            >
              <AlertCircle size={20} />
              Nuevos
            </button>
            <button
              className={`tab-button ${activeTab === 'en_proceso' ? 'active' : ''}`}
              onClick={() => setActiveTab('en_proceso')}
            >
              <Clock size={20} />
              En Proceso
            </button>
            <button
              className={`tab-button ${activeTab === 'resuelto' ? 'active' : ''}`}
              onClick={() => setActiveTab('resuelto')}
            >
              <CheckCircle size={20} />
              Resueltos
            </button>
            <button
              className={`tab-button ${activeTab === 'cerrado' ? 'active' : ''}`}
              onClick={() => setActiveTab('cerrado')}
            >
              <XCircle size={20} />
              Cerrados
            </button>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <div className="loading"></div>
            </div>
          ) : (
            filteredReports.length === 0 ? (
              <div className="no-reports">
                <AlertTriangle size={48} />
                <h3>No hay reportes</h3>
                <p>No se encontraron reportes con el estado seleccionado</p>
              </div>
            ) : (
              <div className="reports-grid">
                {filteredReports.map(report => (
                  <div key={report.id} className="report-wrapper">
                    <ReportCard report={report} />
                    <div className="report-actions">
                      <button
                        className="action-button update-status"
                        onClick={() => handleStatusChange(report.id, getNextStatus(report.estado))}
                        disabled={updatingReportId === report.id || report.estado === 'cerrado'}
                      >
                        {updatingReportId === report.id ? (
                          <>
                            <Loader size={18} className="spinner" />
                            Actualizando...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={18} />
                            {report.estado === 'cerrado' ? 'Reporte Cerrado' : `Marcar como ${getNextStatus(report.estado).replace('_', ' ')}`}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard