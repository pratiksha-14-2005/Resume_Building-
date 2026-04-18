import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../api'
import { useAuth } from '../context/useAuth'

export default function AccountSettings() {
  const { user, refreshMe } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [address, setAddress] = useState(user?.address ?? '')
  const [profileMsg, setProfileMsg] = useState('')
  const [profileErr, setProfileErr] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdErr, setPwdErr] = useState('')
  const [pwdSaving, setPwdSaving] = useState(false)

  async function saveProfile(e) {
    e.preventDefault()
    setProfileErr('')
    setProfileMsg('')
    setProfileSaving(true)
    try {
      await apiFetch('/auth/profile', {
        method: 'PATCH',
        json: {
          name: name.trim(),
          phone: phone.trim() || null,
          address: address.trim() || null,
        },
      })
      await refreshMe()
      setProfileMsg('Profile updated.')
    } catch (err) {
      setProfileErr(err.message || 'Could not update profile')
    } finally {
      setProfileSaving(false)
    }
  }

  async function changePassword(e) {
    e.preventDefault()
    setPwdErr('')
    setPwdMsg('')
    if (newPassword.length < 8) {
      setPwdErr('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwdErr('New password and confirm password must match.')
      return
    }
    setPwdSaving(true)
    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        json: { currentPassword, newPassword },
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPwdMsg('Password changed successfully.')
    } catch (err) {
      setPwdErr(err.message || 'Could not change password')
    } finally {
      setPwdSaving(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1 className="app-title">Account settings</h1>
          <p className="app-sub">
            <Link to="/dashboard">Dashboard</Link>
          </p>
        </div>
      </header>

      <main className="app-main">
        <section className="card">
          <h2>Profile</h2>
          {profileErr ? <p className="banner banner-error">{profileErr}</p> : null}
          {profileMsg ? <p className="banner banner-success">{profileMsg}</p> : null}
          <form className="grid-2" onSubmit={saveProfile}>
            <label className="label">
              Full name
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="label">
              Email
              <input className="input" value={user?.email ?? ''} disabled />
            </label>
            <label className="label">
              Phone
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label className="label">
              Address
              <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
            </label>
            <div>
              <button className="btn btn-primary" type="submit" disabled={profileSaving}>
                {profileSaving ? 'Saving…' : 'Save profile'}
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <h2>Change password</h2>
          {pwdErr ? <p className="banner banner-error">{pwdErr}</p> : null}
          {pwdMsg ? <p className="banner banner-success">{pwdMsg}</p> : null}
          <form className="grid-2" onSubmit={changePassword}>
            <label className="label">
              Current password
              <input
                className="input"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </label>
            <label className="label">
              New password
              <input
                className="input"
                type="password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </label>
            <label className="label">
              Confirm new password
              <input
                className="input"
                type="password"
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>
            <div>
              <button className="btn btn-primary" type="submit" disabled={pwdSaving}>
                {pwdSaving ? 'Updating…' : 'Change password'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}
