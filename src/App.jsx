import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Home from './pages/Home/Home'
import Reports from './pages/Reports/Reports'
import ReportDetail from './pages/ReportDetail/ReportDetail'
import CreateReport from './pages/CreateReport/CreateReport'
import Profile from './pages/Profile/Profile'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import PredictionDashboard from './pages/AdminDashboard/PredictionDashboard'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import NotFound from './pages/NotFound/NotFound'
import { useAuth } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import Notification from './components/Notification/Notification'
import { useWebSocket } from './hooks/useWebSocket'
import './App.css'

function App() {
  const { isAuthenticated, isAdmin, checkAuth } = useAuth()
  const location = useLocation()
  
  // Inicializar WebSocket automáticamente
  useWebSocket()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Rutas donde no se debe mostrar Header y Footer
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.includes(location.pathname)

  return (
    <div className="app">
      {!isAuthRoute && <Header />}
      <main className={isAuthRoute ? "main-content-auth" : "main-content"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route
            path="/create-report"
            element={
              <ProtectedRoute>
                {isAdmin ? <Navigate to="/admin" /> : <CreateReport />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                {isAdmin ? <AdminDashboard /> : <Navigate to="/" />}
              </ProtectedRoute>
            }
          />
          {/* ✅ NUEVA RUTA PARA PREDICCIONES */}
          <Route
            path="/predictions"
            element={
              <ProtectedRoute>
                {isAdmin ? <PredictionDashboard /> : <Navigate to="/" />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/" /> : <Register />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Notification />
      {!isAuthRoute && <Footer />}
    </div>
  )
}

export default App