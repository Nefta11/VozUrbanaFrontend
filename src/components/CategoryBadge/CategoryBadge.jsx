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

const CategoryBadge = ({ category }) => {
  const getCategoryInfo = (categoryId) => {
    const categories = {
      saneamiento: {
        name: 'Saneamiento',
        icon: Droplet,
        color: '#0ea5e9'
      },
      infraestructura: {
        name: 'Infraestructura',
        icon: Building2,
        color: '#8b5cf6'
      },
      salud_publica: {
        name: 'Salud Pública',
        icon: Stethoscope,
        color: '#10b981'
      },
      seguridad: {
        name: 'Seguridad',
        icon: Shield,
        color: '#f59e0b'
      },
      medio_ambiente: {
        name: 'Medio Ambiente',
        icon: Leaf,
        color: '#22c55e'
      },
      otros: {
        name: 'Otros',
        icon: FileQuestion,
        color: '#6b7280'
      }
    }

    return categories[categoryId] || categories.otros
  }

  const categoryInfo = getCategoryInfo(category)
  const Icon = categoryInfo.icon

  return (
    <span
      className="category-badge"
      style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}
    >
      <Icon size={16} />
      <span>{categoryInfo.name}</span>
    </span>
  )
}
CategoryBadge.propTypes = {
  category: PropTypes.string.isRequired
}

export default CategoryBadge