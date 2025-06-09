import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ReportsProvider } from './context/ReportsContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ReportsProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </ReportsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)