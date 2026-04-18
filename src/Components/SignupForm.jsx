import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const SignupForm = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setPending(true)
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Could not create account')
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {error ? <p className="form-error">{error}</p> : null}
      <label className="label">
        <span className="sr-only">Name</span>
        <input
          type="text"
          placeholder="Name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
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
        <span className="sr-only">Phone</span>
        <input
          type="tel"
          placeholder="Phone (optional)"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>
      <label className="label">
        <span className="sr-only">Password</span>
        <input
          type="password"
          placeholder="Password (min. 8 characters)"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </label>

      <button type="submit" disabled={pending}>
        {pending ? 'Creating account…' : 'Sign up'}
      </button>
    </form>
  )
}

export default SignupForm
