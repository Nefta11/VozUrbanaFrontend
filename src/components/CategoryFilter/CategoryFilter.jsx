import { useReports } from '../../hooks/useReports'
import './CategoryFilter.css'

const CategoryFilter = () => {
  const { categories, filters, setFilters } = useReports()
  
  const handleCategoryChange = (categoryId) => {
    setFilters({
      ...filters,
      category: categoryId === filters.category ? '' : categoryId
    })
  }
  
  const handleStatusChange = (e) => {
    setFilters({
      ...filters,
      status: e.target.value
    })
  }
  
  const handleSortChange = (e) => {
    setFilters({
      ...filters,
      sortBy: e.target.value
    })
  }
  
  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      search: e.target.value
    })
  }
  
  const clearFilters = () => {
    setFilters({
      category: '',
      status: '',
      search: '',
      sortBy: 'date'
    })
  }
  
  return (
    <div className="category-filter">
      <div className="filter-section">
        <h3>Categorías</h3>
        <div className="category-buttons">
          {categories.map(category => (
            <button 
              key={category.id}
              className={`category-button ${filters.category === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.nombre}
            </button>
          ))}
        </div>
      </div>
      
      <div className="filter-section">
        <h3>Filtros</h3>
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="status-filter">Estado:</label>
            <select 
              id="status-filter" 
              value={filters.status}
              onChange={handleStatusChange}
            >
              <option value="">Todos</option>
              <option value="nuevo">Nuevo</option>
              <option value="en_proceso">En Proceso</option>
              <option value="resuelto">Resuelto</option>
              <option value="cerrado">Cerrado</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="sort-filter">Ordenar por:</label>
            <select 
              id="sort-filter" 
              value={filters.sortBy}
              onChange={handleSortChange}
            >
              <option value="date">Fecha (más reciente)</option>
              <option value="votes">Votos (más votados)</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="filter-section">
        <h3>Buscar</h3>
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Buscar reportes..." 
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      
      <button 
        className="clear-filters-button"
        onClick={clearFilters}
      >
        Limpiar filtros
      </button>
    </div>
  )
}

export default CategoryFilter