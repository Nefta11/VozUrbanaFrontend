import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Home from './pages/Home/Home'
import Reports from './pages/Reports/Reports'
import ReportDetail from './pages/ReportDetail/ReportDetail'
import CreateReport from './pages/CreateReport/CreateReport'
import Profile from './pages/Profile/Profile'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import NotFound from './pages/NotFound/NotFound'
import { useAuth } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import Notification from './components/Notification/Notification'
import './App.css'

function App() {
  const { isAuthenticated, isAdmin, checkAuth } = useAuth()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route 
            path="/create-report" 
            element={
              <ProtectedRoute>
                <CreateReport />
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
      <Footer />
    </div>
  )
}

export default App