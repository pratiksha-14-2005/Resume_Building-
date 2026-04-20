import React, { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiFetch } from '../api'
import CareerAiPanel from '../Components/CareerAiPanel'

function getPreviewTemplateClass(resume) {
  return `preview-template-${resume.designTemplate || 'classic'}`
}

export default function ResumePreview() {
  const { id } = useParams()
  const [resume, setResume] = useState(null)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await apiFetch(`/resumes/${id}`)
      setResume(data.resume)
    } catch (e) {
      setError(e.message || 'Failed to load resume')
      setResume(null)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function handleDownload() {
    if (!resume) return
    setDownloading(true)
    try {
      const [{ pdf }, { ResumePdfDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../pdf/ResumePdf.jsx'),
      ])
      const blob = await pdf(<ResumePdfDocument resume={resume} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const safe = (resume.title || 'resume').replace(/[^\w-]+/g, '_').slice(0, 80)
      a.download = `${safe}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e.message || 'PDF export failed')
    } finally {
      setDownloading(false)
    }
  }

  if (error && !resume) {
    return (
      <div className="app-shell">
        <p className="banner banner-error">{error}</p>
        <Link to="/dashboard" className="btn btn-secondary">
          Dashboard
        </Link>
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="app-shell">
        <p className="app-loading">Loading preview...</p>
      </div>
    )
  }

  const isFresher = resume.resumeType === 'FRESHER'

  return (
    <div
      className={`app-shell app-shell-editor app-shell-preview ${getPreviewTemplateClass(resume)}`}
      style={{ '--template-accent': resume.designColor || '#0f4c75', '--template-font': resume.designFont || 'Inter, sans-serif' }}
    >
      <header className="app-header">
        <div>
          <h1 className="app-title">{resume.title}</h1>
          <p className="app-sub">
            <Link to="/dashboard">Dashboard</Link>
            {' / '}
            <Link to={`/resume/${id}/edit`}>Edit</Link>
          </p>
        </div>
        <div className="resume-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? 'Preparing PDF...' : 'Download PDF'}
          </button>
        </div>
      </header>

      {error ? <p className="banner banner-error">{error}</p> : null}

      <div className="preview-layout">
        <CareerAiPanel resume={resume} />

        <article className="preview-sheet card preview-sheet-pro">
          <header className="preview-header">
            <h2 className="preview-name">{resume.displayName}</h2>
            <p className="preview-contact">
              {[resume.displayEmail, resume.displayPhone, resume.displayAddress].filter(Boolean).join(' / ')}
            </p>
            <p className="preview-links">
              {resume.linkedInUrl ? (
                <a href={resume.linkedInUrl} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              ) : null}
              {resume.linkedInUrl && resume.githubUrl ? ' / ' : null}
              {resume.githubUrl ? (
                <a href={resume.githubUrl} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              ) : null}
            </p>
          </header>

          {isFresher && resume.objective ? (
            <section className="preview-section">
              <h3>Career objective</h3>
              <p className="preview-body">{resume.objective}</p>
            </section>
          ) : null}
          {!isFresher && resume.professionalSummary ? (
            <section className="preview-section">
              <h3>Professional summary</h3>
              <p className="preview-body">{resume.professionalSummary}</p>
            </section>
          ) : null}

          {resume.educations?.length ? (
            <section className="preview-section">
              <h3>Education</h3>
              <ul className="preview-list">
                {resume.educations.map((e) => (
                  <li key={e.id}>
                    <strong>{e.degree}</strong>
                    {e.institution ? ` - ${e.institution}` : ''}
                    <div className="muted small">
                      {[e.startDate, e.endDate].filter(Boolean).join(' to ')}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {resume.experiences?.length ? (
            <section className="preview-section">
              <h3>Experience</h3>
              {resume.experiences.map((x) => (
                <div key={x.id} className="preview-block">
                  <div>
                    <strong>{x.jobTitle}</strong>
                    {x.company ? ` / ${x.company}` : ''}
                    {x.location ? ` / ${x.location}` : ''}
                  </div>
                  <div className="muted small">
                    {[x.startDate, x.endDate].filter(Boolean).join(' to ')}
                  </div>
                  {x.responsibilities ? <p className="preview-body">{x.responsibilities}</p> : null}
                </div>
              ))}
            </section>
          ) : null}

          {resume.skills?.length ? (
            <section className="preview-section">
              <h3>Skills</h3>
              <p className="preview-body">
                {resume.skills
                  .map((s) => (s.proficiency ? `${s.skillName} (${s.proficiency})` : s.skillName))
                  .join(' / ')}
              </p>
            </section>
          ) : null}

          {resume.certifications?.length ? (
            <section className="preview-section">
              <h3>Certifications</h3>
              <ul className="preview-list">
                {resume.certifications.map((c) => (
                  <li key={c.id}>
                    <strong>{c.certificationName}</strong>
                    <div className="muted">{c.issuingOrganization}</div>
                    <div className="muted small">
                      {[c.issueDate, c.expiryDate].filter(Boolean).join(' to ')}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {resume.projects?.length ? (
            <section className="preview-section">
              <h3>Projects</h3>
              {resume.projects.map((p) => (
                <div key={p.id} className="preview-block">
                  <strong>{p.name}</strong>
                  {p.techStack ? <div className="muted small">{p.techStack}</div> : null}
                  <p className="preview-body">{p.description}</p>
                  {p.link ? (
                    <a href={p.link} target="_blank" rel="noreferrer">
                      Link
                    </a>
                  ) : null}
                </div>
              ))}
            </section>
          ) : null}

          {resume.internships?.length ? (
            <section className="preview-section">
              <h3>Internships / training</h3>
              {resume.internships.map((i) => (
                <div key={i.id} className="preview-block">
                  <strong>{i.company}</strong>
                  <div className="muted small">{[i.role, i.duration].filter(Boolean).join(' / ')}</div>
                  {i.description ? <p className="preview-body">{i.description}</p> : null}
                </div>
              ))}
            </section>
          ) : null}

          {resume.achievements?.length ? (
            <section className="preview-section">
              <h3>Achievements</h3>
              <ul className="preview-list">
                {resume.achievements.map((a) => (
                  <li key={a.id}>{a.content}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {resume.extracurriculars?.length ? (
            <section className="preview-section">
              <h3>Extra-curricular</h3>
              <ul className="preview-list">
                {resume.extracurriculars.map((x) => (
                  <li key={x.id}>{x.content}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>
      </div>
    </div>
  )
}
