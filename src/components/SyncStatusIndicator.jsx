/**
 * SyncStatusIndicator - Componente para mostrar el estado de sincronización
 *
 * Muestra:
 * - Estado de conexión (online/offline)
 * - Estado de sincronización (sincronizando/éxito/error)
 * - Botón para forzar sincronización manual
 * - Información de última sincronización
 */

import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useReports } from '../hooks/useReports'
import syncService from '../services/syncService'

const SyncStatusIndicator = ({ position = 'bottom-right', compact = false }) => {
  const { isOnline, isSyncing, syncStatus, syncData } = useReports()
  const [syncInfo, setSyncInfo] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Cargar información de sincronización
    const loadSyncInfo = async () => {
      const info = await syncService.getSyncStatus()
      setSyncInfo(info)
    }

    loadSyncInfo()

    // Actualizar cada 10 segundos
    const interval = setInterval(loadSyncInfo, 10000)
    return () => clearInterval(interval)
  }, [syncStatus])

  const getStatusIcon = () => {
    if (isSyncing) return '🔄'
    if (!isOnline) return '📴'
    if (syncStatus === 'error') return '⚠️'
    if (syncStatus === 'success') return '✅'
    return '🌐'
  }

  const getStatusText = () => {
    if (isSyncing) return 'Sincronizando...'
    if (!isOnline) return 'Sin conexión'
    if (syncStatus === 'error') return 'Error al sincronizar'
    if (syncStatus === 'success') return 'Sincronizado'
    return 'Conectado'
  }

  const getStatusColor = () => {
    if (isSyncing) return '#2196F3' // Azul
    if (!isOnline) return '#FF9800' // Naranja
    if (syncStatus === 'error') return '#F44336' // Rojo
    if (syncStatus === 'success') return '#4CAF50' // Verde
    return '#4CAF50' // Verde por defecto
  }

  const handleSync = async () => {
    try {
      await syncData()
    } catch (error) {
      console.error('Error al sincronizar:', error)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Nunca'
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    // Menos de 1 minuto
    if (diff < 60000) return 'Hace un momento'

    // Menos de 1 hora
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)
      return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
    }

    // Menos de 1 día
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      return `Hace ${hours} hora${hours > 1 ? 's' : ''}`
    }

    // Formato completo
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const positionStyles = {
    'top-left': { top: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'bottom-right': { bottom: '20px', right: '20px' }
  }

  if (compact) {
    // Modo compacto: solo un badge pequeño
    return (
      <div
        style={{
          position: 'fixed',
          ...positionStyles[position],
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontSize: '14px',
          cursor: 'pointer'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
            animation: isSyncing ? 'pulse 1.5s infinite' : 'none'
          }}
        />
        <span style={{ fontWeight: '500' }}>{getStatusIcon()}</span>
      </div>
    )
  }

  // Modo completo
  return (
    <div
      style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: 9999,
        minWidth: isExpanded ? '300px' : 'auto'
      }}
    >
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            cursor: 'pointer'
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '20px',
                animation: isSyncing ? 'spin 1s linear infinite' : 'none'
              }}
            >
              {getStatusIcon()}
            </span>
            <div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333'
                }}
              >
                {getStatusText()}
              </div>
              {syncInfo && isExpanded && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#666',
                    marginTop: '2px'
                  }}
                >
                  {formatDate(syncInfo.lastSync)}
                </div>
              )}
            </div>
          </div>

          <span style={{ fontSize: '12px', color: '#999' }}>
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>

        {/* Detalles expandidos */}
        {isExpanded && syncInfo && (
          <>
            <div
              style={{
                borderTop: '1px solid #eee',
                paddingTop: '8px',
                fontSize: '13px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '4px'
                }}
              >
                <span style={{ color: '#666' }}>Operaciones pendientes:</span>
                <span style={{ fontWeight: '600' }}>
                  {syncInfo.pendingOperations}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '4px'
                }}
              >
                <span style={{ color: '#666' }}>Reportes locales:</span>
                <span style={{ fontWeight: '600' }}>
                  {syncInfo.databaseSize?.reports || 0}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ color: '#666' }}>Categorías:</span>
                <span style={{ fontWeight: '600' }}>
                  {syncInfo.databaseSize?.categories || 0}
                </span>
              </div>
            </div>

            {/* Botón de sincronización */}
            {isOnline && (
              <button
                onClick={handleSync}
                disabled={isSyncing}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isSyncing ? '#ccc' : '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: isSyncing ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isSyncing) {
                    e.target.style.backgroundColor = '#1976D2'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSyncing) {
                    e.target.style.backgroundColor = '#2196F3'
                  }
                }}
              >
                {isSyncing ? '🔄 Sincronizando...' : '↻ Sincronizar Ahora'}
              </button>
            )}

            {!isOnline && syncInfo.pendingOperations > 0 && (
              <div
                style={{
                  padding: '8px',
                  backgroundColor: '#FFF3E0',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#E65100',
                  textAlign: 'center'
                }}
              >
                Los cambios se sincronizarán cuando haya conexión
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

SyncStatusIndicator.propTypes = {
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
  compact: PropTypes.bool
}

export default SyncStatusIndicator
