import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="app-loading" role="status" aria-live="polite">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  return children
}
