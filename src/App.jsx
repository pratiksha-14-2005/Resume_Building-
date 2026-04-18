import React from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import AuthPage from './Components/AuthPage'
import ProtectedRoute from './Components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import AccountSettings from './pages/AccountSettings'
import ResumeEditor from './pages/ResumeEditor'
import ResumePreview from './pages/ResumePreview'
import './styles/app.css'

function HomeGate() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="app-loading" role="status">
        Loading…
      </div>
    )
  }
  if (user) {
    return <Navigate to="/dashboard" replace />
  }
  return <AuthPage />
}

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeGate />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume/:id/edit"
            element={
              <ProtectedRoute>
                <ResumeEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume/:id/preview"
            element={
              <ProtectedRoute>
                <ResumePreview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AccountSettings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
