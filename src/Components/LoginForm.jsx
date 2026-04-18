import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const LoginForm = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setPending(true)
    try {
      await login(email.trim(), password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {error ? <p className="form-error">{error}</p> : null}
      <label className="label">
        <span className="sr-only">Email</span>
        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="label">
        <span className="sr-only">Password</span>
        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      <button type="submit" disabled={pending}>
        {pending ? 'Signing in…' : 'Login'}
      </button>
    </form>
  )
}

export default LoginForm
