import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../api'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshMe = useCallback(async () => {
    try {
      const data = await apiFetch('/auth/me')
      setUser(data.user)
      return data.user
    } catch {
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const data = await apiFetch('/auth/me')
        if (!cancelled) setUser(data.user)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      json: { email, password },
    })
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (payload) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      json: payload,
    })
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    await apiFetch('/auth/logout', { method: 'POST' })
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      refreshMe,
      login,
      register,
      logout,
    }),
    [user, loading, refreshMe, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
