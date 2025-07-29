import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { MapPin, List } from 'lucide-react'
import { useReports } from '../../hooks/useReports'
import ReportCard from '../../components/ReportCard/ReportCard'
import SkeletonReportList from '../../components/SkeletonReportList/SkeletonReportList'
import CategoryFilter from '../../components/CategoryFilter/CategoryFilter'
import MapView from '../../components/MapView/MapView'
import './Reports.css'

const Reports = () => {
  const { filteredReports, isLoading, error, setFilters, filters } = useReports()
  const location = useLocation()
  const [viewMode, setViewMode] = useState('list')
  const [visibleCount, setVisibleCount] = useState(6)
  const handleShowMore = () => setVisibleCount((prev) => prev + 6)
  const handleShowLess = () => setVisibleCount((prev) => Math.max(6, prev - 6))
  
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const category = params.get('category')
    
    if (category) {
      setFilters({
        ...filters,
        category
      })
    }
  }, [location.search, setFilters, filters])
  
  return (
    <div className="reports-page">
      <div className="container">
        <div className="page-header">
          <h1>Reportes Ciudadanos</h1>
          <p>Explora los reportes enviados por la comunidad</p>
          
          <div className="view-toggle">
            <button 
              className={`view-toggle-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={20} />
              Lista
            </button>
            <button 
              className={`view-toggle-button ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
            >
              <MapPin size={20} />
              Mapa
            </button>
          </div>
        </div>
        
        <div className="reports-layout">
          <aside className="filters-sidebar">
            <CategoryFilter />
          </aside>
          
          <main className="reports-content">
            {isLoading ? (
              <SkeletonReportList />
            ) : error ? (
              <div className="error-container">
                <p>{error}</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="no-reports">
                <h3>No se encontraron reportes</h3>
                <p>Intenta con otros filtros o crea un nuevo reporte.</p>
              </div>
            ) : viewMode === 'map' ? (
              <div className="reports-map">
                <MapView height="700px" zoom={13} showPopups={true} />
              </div>
            ) : (
              <>
                <div className="reports-header">
                  <p>Mostrando {Math.min(visibleCount, filteredReports.length)} de {filteredReports.length} reporte(s)</p>
                </div>
                <div className="reports-grid">
                  {filteredReports.slice(0, visibleCount).map(report => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </div>
                <div className="reports-pagination" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', margin: '2rem 0' }}>
                  {visibleCount < filteredReports.length && (
                    <button className="ver-mas-btn" onClick={handleShowMore} style={{padding:'0.5rem 1.5rem', borderRadius:'6px', background:'#3b82f6', color:'#fff', border:'none', fontWeight:'bold', cursor:'pointer'}}>
                      Ver más
                    </button>
                  )}
                  {visibleCount > 6 && (
                    <button className="ver-menos-btn" onClick={handleShowLess} style={{padding:'0.5rem 1.5rem', borderRadius:'6px', background:'#e5e7eb', color:'#222', border:'none', fontWeight:'bold', cursor:'pointer'}}>
                      Ver menos
                    </button>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Reports