import { createContext, useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { reportsAPI } from '../services/reportsAPI'
import syncService from '../services/syncService'
import useNetworkStatus from '../hooks/useNetworkStatus'

export const ReportsContext = createContext()

export const ReportsProvider = ({ children }) => {
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: '',
    sortBy: 'date'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState(null)

  // Hook para detectar estado de red
  const { isOnline } = useNetworkStatus({
    onOnline: async () => {
      console.log('Conexión restaurada, sincronizando...')
      await syncData()
    },
    onOffline: () => {
      console.log('Modo offline activado')
      setSyncStatus('offline')
    }
  })

  // Función de sincronización completa
  const syncData = useCallback(async () => {
    if (isSyncing) return

    setIsSyncing(true)
    setSyncStatus('syncing')

    try {
      const result = await syncService.syncAll()
      if (result.success) {
        setSyncStatus('success')
        // Recargar datos después de sincronizar
        await fetchReportsFromCache()
      } else {
        setSyncStatus('error')
      }
    } catch (err) {
      console.error('Error en sincronización:', err)
      setSyncStatus('error')
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing])

  // Cargar reportes desde caché local (híbrido)
  const fetchReportsFromCache = useCallback(async () => {
    try {
      const data = await syncService.getReports({ forceRefresh: false })
      setReports(data)
      return data
    } catch (err) {
      console.error('Error cargando desde caché:', err)
      return []
    }
  }, [])

  const fetchReports = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Siempre cargar desde IndexedDB
      const data = await reportsAPI.getAll()
      setReports(data)
      console.log('Reportes cargados:', data.length)
      return data
    } catch (err) {
      setError(err.message || 'Error al cargar reportes')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      // Obtener categorías (con fallback local)
      const data = await reportsAPI.getCategories()
      setCategories(data)
      console.log('Categorías cargadas:', data.length)
      return data
    } catch (err) {
      console.error('Error al cargar categorías:', err)
      return []
    }
  }, [])

  const getReportById = useCallback(async (id) => {
    setIsLoading(true)
    setError(null)

    try {
      // Obtener desde IndexedDB
      const report = await reportsAPI.getById(id)
      return report
    } catch (err) {
      setError(err.message || `Error al cargar el reporte ${id}`)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getReportsByUser = useCallback(async (userId) => {
    setIsLoading(true)
    setError(null)

    try {
      const reports = await reportsAPI.getByUser(userId)
      return reports
    } catch (err) {
      setError(err.message || `Error al cargar los reportes del usuario ${userId}`)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getReportsByStatus = useCallback(async (status) => {
    setIsLoading(true)
    setError(null)

    try {
      const reports = await reportsAPI.getByStatus(status)
      return reports
    } catch (err) {
      setError(err.message || `Error al cargar los reportes con estado ${status}`)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateStatus = useCallback(async (reportId, newStatus) => {
    setIsLoading(true)
    setError(null)

    try {
      const updatedReport = await reportsAPI.updateStatus(reportId, newStatus)
      setReports(prev =>
        prev.map(report => report.id === reportId ? updatedReport : report)
      )
      setFilteredReports(prev =>
        prev.map(report => report.id === reportId ? updatedReport : report)
      )
      return updatedReport
    } catch (err) {
      setError(err.message || `Error al actualizar el estado del reporte ${reportId}`)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateStatusAdmin = useCallback(async (reportId, newStatus, asignado_a = null) => {
    setIsLoading(true)
    setError(null)

    try {
      const updatedReport = await reportsAPI.updateStatusAdmin(reportId, newStatus, asignado_a)

      setReports(prev => {
        const updated = prev.map(report =>
          (report.id === reportId || report.id === Number(reportId)) ? updatedReport : report
        )
        return updated;
      })
      setFilteredReports(prev => {
        const updated = prev.map(report =>
          (report.id === reportId || report.id === Number(reportId)) ? updatedReport : report
        )
        return updated;
      })
      return updatedReport
    } catch (err) {
      console.error('Error en updateStatusAdmin:', err)
      let errorMessage = 'Error al actualizar el estado del reporte'
      
      if (err.response?.status === 400) {
        errorMessage = 'Estado no válido. Verifica que el backend soporte el estado "no_aprobado"'
      } else if (err.response?.status === 403) {
        errorMessage = 'No tienes permisos para realizar esta acción'
      } else if (err.response?.status === 404) {
        errorMessage = 'Reporte no encontrado'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Crear reporte usando IndexedDB directamente
  const createReport = useCallback(async (reportData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Siempre crear en IndexedDB directamente
      const newReport = await reportsAPI.create(reportData)

      // Actualizar la lista local de reportes
      setReports(prev => [...prev, newReport])
      setFilteredReports(prev => [...prev, newReport])

      console.log('Reporte creado exitosamente:', newReport)

      return newReport
    } catch (err) {
      const errorMessage = err.message || 'Error al crear reporte'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateReport = useCallback(async (id, reportData) => {
    setIsLoading(true)
    setError(null)

    try {
      let updatedReport

      if (isOnline) {
        // Modo online: actualizar en servidor
        updatedReport = await reportsAPI.update(id, reportData)
      } else {
        // Modo offline: actualizar localmente y añadir a cola
        updatedReport = await syncService.updateReportOffline(id, reportData)
      }

      setReports(prev =>
        prev.map(report => report.id === id ? updatedReport : report)
      )
      setFilteredReports(prev =>
        prev.map(report => report.id === id ? updatedReport : report)
      )
      return updatedReport
    } catch (err) {
      setError(err.message || `Error al actualizar reporte ${id}`)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isOnline])

  const voteReport = useCallback(async (id, voteType) => {
    try {
      const result = await reportsAPI.vote(id, voteType)
      if (result.success) {
        // Actualizar el reporte con los nuevos votos
        const updateReportVotes = (report) => {
          if (report.id === Number(id)) {
            return {
              ...report,
              votos_positivos: result.votos.positivos,
              votos_negativos: result.votos.negativos
            }
          }
          return report
        }

        setReports(prev => prev.map(updateReportVotes))
        setFilteredReports(prev => prev.map(updateReportVotes))

        return result
      }
      return null
    } catch (err) {
      console.error(`Error al votar en reporte ${id}:`, err)
      setError(err.message || 'Error al votar')
      return null
    }
  }, [])

  const addComment = useCallback(async (reportId, commentData) => {
    try {
      const result = await reportsAPI.addComment(reportId, commentData)
      if (result.success) {
        // Actualizar el reporte con los nuevos comentarios
        const updateReportComments = (report) => {
          if (report.id === Number(reportId)) {
            return {
              ...report,
              comentarios: result.comentarios
            }
          }
          return report
        }

        setReports(prev => prev.map(updateReportComments))
        setFilteredReports(prev => prev.map(updateReportComments))

        return result
      }
      return null
    } catch (err) {
      console.error(`Error al añadir comentario al reporte ${reportId}:`, err)
      setError(err.message || 'Error al añadir comentario')
      return null
    }
  }, [])

  const deleteComment = useCallback(async (commentId, reportId) => {
    try {
      const result = await reportsAPI.deleteComment(commentId)
      if (result.success) {
        // Actualizar los comentarios del reporte
        const updatedComments = await reportsAPI.getComments(reportId)

        const updateReportComments = (report) => {
          if (report.id === Number(reportId)) {
            return {
              ...report,
              comentarios: updatedComments
            }
          }
          return report
        }

        setReports(prev => prev.map(updateReportComments))
        setFilteredReports(prev => prev.map(updateReportComments))

        return result
      }
      return null
    } catch (err) {
      console.error(`Error al eliminar comentario ${commentId}:`, err)
      setError(err.message || 'Error al eliminar comentario')
      return null
    }
  }, [])

  const updateComment = useCallback(async (commentId, texto, reportId) => {
    try {
      const result = await reportsAPI.updateComment(commentId, texto)
      if (result.success) {
        // Actualizar los comentarios del reporte
        const updatedComments = await reportsAPI.getComments(reportId)

        const updateReportComments = (report) => {
          if (report.id === Number(reportId)) {
            return {
              ...report,
              comentarios: updatedComments
            }
          }
          return report
        }

        setReports(prev => prev.map(updateReportComments))
        setFilteredReports(prev => prev.map(updateReportComments))

        return result
      }
      return null
    } catch (err) {
      console.error(`Error al actualizar comentario ${commentId}:`, err)
      setError(err.message || 'Error al actualizar comentario')
      return null
    }
  }, [])

  const applyFilters = useCallback((isAdmin = false) => {
    let result = [...reports]

    // Filter out only "nuevo" reports for non-admin users
    if (!isAdmin) {
      result = result.filter(
        report => report.estado !== 'nuevo' && report.estado !== 'no_aprobado'
      )
    }

    // Filter by category
    if (filters.category) {
      result = result.filter(report =>
        report.categoria === filters.category
      )
    }

    // Filter by status
    if (filters.status) {
      result = result.filter(report =>
        report.estado === filters.status
      )
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      result = result.filter(report =>
        report.titulo.toLowerCase().includes(searchTerm) ||
        report.descripcion.toLowerCase().includes(searchTerm) ||
        report.ubicacion.toLowerCase().includes(searchTerm)
      )
    }

    // Sort results
    if (filters.sortBy === 'date') {
      result.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
    } else if (filters.sortBy === 'votes') {
      result.sort((a, b) =>
        (b.votos_positivos - b.votos_negativos) -
        (a.votos_positivos - a.votos_negativos)
      )
    }

    setFilteredReports(result)
  }, [reports, filters])

  // Apply filters when filters or reports change
  useEffect(() => {
    // Get admin status from localStorage token
    const token = localStorage.getItem('token')
    let isAdmin = false
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        isAdmin = payload.rol === 'admin'
      } catch {
        isAdmin = false
      }
    }
    applyFilters(isAdmin)
  }, [filters, reports, applyFilters])

  // Initial data fetch
  useEffect(() => {
    fetchReports()
    fetchCategories()
  }, [fetchReports, fetchCategories])

  const value = {
    reports,
    filteredReports,
    categories,
    filters,
    isLoading,
    error,
    fetchReports,
    fetchCategories,
    getReportById,
    getReportsByUser,
    getReportsByStatus,
    createReport,
    updateReport,
    updateStatus,
    updateStatusAdmin,
    voteReport,
    addComment,
    updateComment,
    deleteComment,
    setFilters,
    // Nuevas propiedades para modo híbrido
    isOnline,
    isSyncing,
    syncStatus,
    syncData
  }

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  )
}

// Validación de PropTypes
ReportsProvider.propTypes = {
  children: PropTypes.node.isRequired
}