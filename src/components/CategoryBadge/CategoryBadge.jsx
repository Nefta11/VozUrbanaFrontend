import { memo } from 'react'
import {
  Droplets,
  Construction,
  Heart,
  Shield,
  Leaf,
  Zap,
  Bus,
  AlertCircle,
  Building2,
  Stethoscope,
  FileQuestion,
  Trash2
} from 'lucide-react'
import { useReports } from '../../hooks/useReports'
import './CategoryBadge.css'
import PropTypes from 'prop-types'

// Mapeo de iconos dinámico
const ICON_MAP = {
  Droplets,
  Construction,
  Heart,
  Shield,
  Leaf,
  Zap,
  Bus,
  AlertCircle,
  Building2,
  Stethoscope,
  FileQuestion,
  Trash2,
  // Fallbacks para compatibilidad
  Droplet: Droplets,
  Road: Construction // Mapeo de Road a Construction
}

// Configuración de categorías fallback - movida fuera del componente
const FALLBACK_CATEGORIES = {
  saneamiento: {
    name: 'Saneamiento',
    icon: 'Droplets',
    color: '#0ea5e9',
    className: 'saneamiento'
  },
  infraestructura: {
    name: 'Infraestructura',
    icon: 'Construction',
    color: '#3b82f6',
    className: 'infraestructura'
  },
  salud_publica: {
    name: 'Salud Pública',
    icon: 'Heart',
    color: '#ef4444',
    className: 'salud-publica'
  },
  seguridad: {
    name: 'Seguridad',
    icon: 'Shield',
    color: '#f59e0b',
    className: 'seguridad'
  },
  medio_ambiente: {
    name: 'Medio Ambiente',
    icon: 'Leaf',
    color: '#10b981',
    className: 'medio-ambiente'
  },
  servicios_publicos: {
    name: 'Servicios Públicos',
    icon: 'Zap',
    color: '#8b5cf6',
    className: 'servicios-publicos'
  },
  transporte: {
    name: 'Transporte',
    icon: 'Bus',
    color: '#ec4899',
    className: 'transporte'
  },
  otros: {
    name: 'Otros',
    icon: 'AlertCircle',
    color: '#6b7280',
    className: 'otros'
  }
}

// Mapeo de colores por defecto para categorías
const DEFAULT_COLORS = {
  'Saneamiento': '#0EA5E9',
  'Infraestructura': '#3B82F6',
  'Salud Pública': '#EF4444',
  'Seguridad': '#F59E0B',
  'Medio Ambiente': '#10B981',
  'Servicios Públicos': '#8B5CF6',
  'Transporte': '#EC4899',
  'Otros': '#6B7280'
}

// Función helper para obtener información de categoría
const getCategoryInfo = (category, categories) => {
  // Validar y normalizar el parámetro category
  if (!category && category !== 0) {
    // Si category es null, undefined, o string vacía, usar fallback
    const fallbackCategory = FALLBACK_CATEGORIES.otros
    const IconComponent = ICON_MAP[fallbackCategory.icon] || ICON_MAP.AlertCircle
    const color = DEFAULT_COLORS[fallbackCategory.name] || fallbackCategory.color || '#6b7280'

    return {
      ...fallbackCategory,
      icon: IconComponent,
      color: color
    }
  }

  // Convertir a string para manejo consistente
  const categoryStr = String(category)

  // Buscar primero en las categorías del backend
  const backendCategory = categories.find(cat => {
    if (!cat || !cat.nombre) return false

    return (
      String(cat.nombre).toLowerCase() === categoryStr.toLowerCase() ||
      String(cat.id) === categoryStr
    )
  })

  if (backendCategory) {
    const IconComponent = ICON_MAP[backendCategory.icono] || ICON_MAP.AlertCircle
    const color = backendCategory.color || DEFAULT_COLORS[backendCategory.nombre] || '#6b7280'

    return {
      name: backendCategory.nombre,
      icon: IconComponent,
      color: color,
      className: String(backendCategory.nombre).toLowerCase().replace(/\s+/g, '-')
    }
  }

  // Fallback a categorías locales  
  const fallbackKey = categoryStr.toLowerCase().replace(/\s+/g, '_')
  const fallbackCategory = FALLBACK_CATEGORIES[fallbackKey] || FALLBACK_CATEGORIES.otros
  const IconComponent = ICON_MAP[fallbackCategory.icon] || ICON_MAP.AlertCircle
  const color = DEFAULT_COLORS[fallbackCategory.name] || fallbackCategory.color || '#6b7280'

  return {
    ...fallbackCategory,
    icon: IconComponent,
    color: color
  }
}

const CategoryBadge = memo(({ category }) => {
  const { categories } = useReports()

  // Validar que categories sea un array
  const safeCategories = Array.isArray(categories) ? categories : []

  // Obtener información de la categoría
  const categoryInfo = getCategoryInfo(category, safeCategories)

  return (
    <span
      className={`category-badge category-badge--${categoryInfo.className}`}
      style={{ '--category-color': categoryInfo.color }}
      title={`Categoría: ${categoryInfo.name}`}
      role="status"
      aria-label={`Categoría ${categoryInfo.name}`}
    >
      <categoryInfo.icon size={16} aria-hidden="true" />
      <span>{categoryInfo.name}</span>
    </span>
  )
})

CategoryBadge.displayName = 'CategoryBadge'

CategoryBadge.propTypes = {
  category: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.object
  ])
}

export default CategoryBadge