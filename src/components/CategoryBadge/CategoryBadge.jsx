import { memo } from 'react'
import {
  Droplet,
  Building2,
  Stethoscope,
  Shield,
  Leaf,
  FileQuestion
} from 'lucide-react'
import './CategoryBadge.css'
import PropTypes from 'prop-types'

// Configuración de categorías - movida fuera del componente para evitar recreación
const CATEGORIES_CONFIG = {
  saneamiento: {
    name: 'Saneamiento',
    icon: Droplet,
    color: '#0ea5e9',
    className: 'saneamiento'
  },
  infraestructura: {
    name: 'Infraestructura',
    icon: Building2,
    color: '#8b5cf6',
    className: 'infraestructura'
  },
  salud_publica: {
    name: 'Salud Pública',
    icon: Stethoscope,
    color: '#10b981',
    className: 'salud-publica'
  },
  seguridad: {
    name: 'Seguridad',
    icon: Shield,
    color: '#f59e0b',
    className: 'seguridad'
  },
  medio_ambiente: {
    name: 'Medio Ambiente',
    icon: Leaf,
    color: '#22c55e',
    className: 'medio-ambiente'
  },
  otros: {
    name: 'Otros',
    icon: FileQuestion,
    color: '#6b7280',
    className: 'otros'
  }
}

const CategoryBadge = memo(({ category }) => {
  // Validación y obtención de información de categoría
  const categoryInfo = CATEGORIES_CONFIG[category] || CATEGORIES_CONFIG.otros
  const Icon = categoryInfo.icon

  return (
    <span
      className={`category-badge category-badge--${categoryInfo.className}`}
      title={`Categoría: ${categoryInfo.name}`}
      role="badge"
      aria-label={`Categoría ${categoryInfo.name}`}
    >
      <Icon size={16} aria-hidden="true" />
      <span>{categoryInfo.name}</span>
    </span>
  )
})

CategoryBadge.displayName = 'CategoryBadge'

CategoryBadge.propTypes = {
  category: PropTypes.oneOf([
    'saneamiento',
    'infraestructura',
    'salud_publica',
    'seguridad',
    'medio_ambiente',
    'otros'
  ]).isRequired
}

export default CategoryBadge