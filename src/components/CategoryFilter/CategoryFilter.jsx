import { memo, useCallback } from 'react'
import { useReports } from '../../hooks/useReports'
import { useAuth } from '../../hooks/useAuth'
import './CategoryFilter.css'

// Configuración de opciones de filtros
const FILTER_OPTIONS = {
  status: [
    { value: '', label: 'Todos' },
    { value: 'nuevo', label: 'Nuevo', adminOnly: true },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'resuelto', label: 'Resuelto' },
    { value: 'cerrado', label: 'Cerrado' }
  ],
  sortBy: [
    { value: 'date', label: 'Fecha (más reciente)' },
    { value: 'votes', label: 'Votos (más votados)' },
    { value: 'priority', label: 'Prioridad (alta primero)' },
    { value: 'alphabetical', label: 'Alfabético (A-Z)' }
  ]
}

const CategoryFilter = memo(() => {
  const { categories, filters, setFilters } = useReports()
  const { isAdmin } = useAuth()

  // Filtrar opciones de estado basado en el rol del usuario
  const statusOptions = FILTER_OPTIONS.status.filter(option => 
    !option.adminOnly || isAdmin
  )

  // Handler genérico para cambios en filtros - elimina repetición
  const handleFilterChange = useCallback((filterKey, value) => {
    // Si el usuario no es admin y está intentando seleccionar "nuevo", no permitirlo
    if (filterKey === 'status' && value === 'nuevo' && !isAdmin) {
      return
    }
    
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterKey]: value
    }))
  }, [setFilters, isAdmin])

  // Efecto para limpiar filtro "nuevo" si el usuario no es admin
  const effectiveStatusFilter = (!isAdmin && filters.status === 'nuevo') ? '' : filters.status

  // Handler específico para categorías con toggle
  const handleCategoryChange = useCallback((categoryName) => {
    // Normalizar el nombre visual a nombre interno
    const normalizeCategoryName = (name) => {
      const map = {
        'Saneamiento': 'saneamiento',
        'Infraestructura': 'infraestructura',
        'Servicios Públicos': 'servicios_publicos',
        'Limpieza': 'limpieza',
        'Seguridad': 'seguridad',
        'Transporte': 'transporte',
        'Medio Ambiente': 'medio_ambiente',
        'Salud Pública': 'salud_publica',
        'Otros': 'otros'
      }
      return map[name] || name
    }
    const normalized = normalizeCategoryName(categoryName)
    const newValue = normalized === filters.category ? '' : normalized
    handleFilterChange('category', newValue)
  }, [filters.category, handleFilterChange])

  // Handler para limpiar todos los filtros
  const clearFilters = useCallback(() => {
    setFilters({
      category: '',
      status: '',
      search: '',
      sortBy: 'date'
    })
  }, [setFilters])

  return (
    <div className="category-filter" role="region" aria-label="Filtros de reportes">
      {/* Sección de Categorías */}
      <div className="filter-section">
        <h3>Categorías</h3>
        <div className="category-buttons" role="group" aria-label="Seleccionar categoría">
          {categories?.map(category => {
            // Normalizar para comparar con el filtro activo
            const normalizeCategoryName = (name) => {
              const map = {
                'Saneamiento': 'saneamiento',
                'Infraestructura': 'infraestructura',
                'Servicios Públicos': 'servicios_publicos',
                'Limpieza': 'limpieza',
                'Seguridad': 'seguridad',
                'Transporte': 'transporte',
                'Medio Ambiente': 'medio_ambiente',
                'Salud Pública': 'salud_publica',
                'Otros': 'otros'
              }
              return map[name] || name
            }
            const normalized = normalizeCategoryName(category.nombre)
            return (
              <button
                key={category.id}
                className={`category-button ${filters.category === normalized ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.nombre)}
                aria-pressed={filters.category === normalized}
                title={`Filtrar por categoría: ${category.nombre}`}
              >
                {category.nombre}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sección de Filtros */}
      <div className="filter-section">
        <h3>Filtros</h3>
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="status-filter">Estado:</label>
            <select
              id="status-filter"
              value={effectiveStatusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              aria-describedby="status-help"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span id="status-help" className="sr-only">
              Filtrar reportes por su estado actual
            </span>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-filter">Ordenar por:</label>
            <select
              id="sort-filter"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              aria-describedby="sort-help"
            >
              {FILTER_OPTIONS.sortBy.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span id="sort-help" className="sr-only">
              Ordenar la lista de reportes
            </span>
          </div>
        </div>
      </div>

      {/* Sección de Búsqueda */}
      <div className="filter-section">
        <h3>Buscar</h3>
        <div className="search-box">
          <label htmlFor="search-input" className="sr-only">
            Buscar en reportes
          </label>
          <input
            id="search-input"
            type="text"
            placeholder="Buscar reportes..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            aria-describedby="search-help"
          />
          <span id="search-help" className="sr-only">
            Buscar reportes por título, descripción o ubicación
          </span>
        </div>
      </div>

      {/* Botón de limpiar filtros */}
      <button
        className="clear-filters-button"
        onClick={clearFilters}
        aria-label="Limpiar todos los filtros aplicados"
        title="Restablecer todos los filtros a su estado inicial"
      >
        Limpiar filtros
      </button>
    </div>
  )
})

CategoryFilter.displayName = 'CategoryFilter'

export default CategoryFilter