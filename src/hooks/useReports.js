import { useContext } from 'react'
import { ReportsContext } from '../context/ReportsContext'

export const useReports = () => {
  const context = useContext(ReportsContext)
  
  if (!context) {
    throw new Error('useReports debe ser usado dentro de un ReportsProvider')
  }
  
  return context
}