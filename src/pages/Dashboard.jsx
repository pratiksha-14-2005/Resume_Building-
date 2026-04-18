import React, { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { useAuth } from '../context/useAuth'
export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [resumes, setResumes] = useState([])
  const [loadError, setLoadError] = useState('')
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('FRESHER')

  const load = useCallback(async () => {
    setLoadError('')
    try {
      const data = await apiFetch('/resumes')
      setResumes(data.resumes)
    } catch (e) {
      setLoadError(e.message || 'Failed to load resumes')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleCreate(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const data = await apiFetch('/resumes', {
        method: 'POST',
        json: { title: newTitle.trim(), resumeType: newType },
      })
      setNewTitle('')
      navigate(`/resume/${data.resume.id}/edit`)
    } catch (err) {
      setLoadError(err.message || 'Could not create resume')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete resume “${title}”? This cannot be undone.`)) return
    try {
      await apiFetch(`/resumes/${id}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setLoadError(err.message || 'Delete failed')
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1 className="app-title">Resume Builder</h1>
          <p className="app-sub">
            Signed in as <strong>{user?.name}</strong> ({user?.email})
          </p>
          <p className="app-sub">
            <Link to="/settings">Account settings</Link>
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <main className="app-main">
        {loadError ? <p className="banner banner-error">{loadError}</p> : null}

        <section className="card">
          <h2>Create a resume</h2>
          <form className="inline-form" onSubmit={handleCreate}>
            <label className="sr-only" htmlFor="new-title">
              Resume title
            </label>
            <input
              id="new-title"
              className="input"
              placeholder="e.g. Software engineer — campus placements"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              maxLength={200}
            />
            <label className="sr-only" htmlFor="new-type">
              Resume type
            </label>
            <select
              id="new-type"
              className="input input-select"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
            >
              <option value="FRESHER">Fresher</option>
              <option value="EXPERIENCED">Experienced</option>
            </select>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Creating…' : 'Create'}
            </button>
          </form>
        </section>

        <section className="card">
          <h2>Your resumes</h2>
          {resumes.length === 0 ? (
            <p className="muted">No resumes yet. Create one above.</p>
          ) : (
            <ul className="resume-list">
              {resumes.map((r) => (
                <li key={r.id} className="resume-row">
                  <div>
                    <div className="resume-row-title">{r.title}</div>
                    <div className="muted small">
                      {r.resumeType === 'FRESHER' ? 'Fresher' : 'Experienced'} · Updated{' '}
                      {new Date(r.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="resume-actions">
                    <Link className="btn btn-secondary" to={`/resume/${r.id}/edit`}>
                      Edit
                    </Link>
                    <Link className="btn btn-secondary" to={`/resume/${r.id}/preview`}>
                      Preview
                    </Link>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDelete(r.id, r.title)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
