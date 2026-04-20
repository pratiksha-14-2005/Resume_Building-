import React, { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiFetch } from '../api'
import ResumeAiAssistant from '../Components/ResumeAiAssistant'
import TemplateStudio from '../Components/TemplateStudio'
import {
  emptyCertification,
  emptyEducation,
  emptyExperience,
  emptyInternship,
  emptyLine,
  emptyProject,
  emptySkill,
  formToPayload,
  resumeToForm,
} from '../utils/resumeForm'

function clone(arr) {
  return arr.map((x) => ({ ...x }))
}

export default function ResumeEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoadError('')
    try {
      const data = await apiFetch(`/resumes/${id}`)
      setForm(resumeToForm(data.resume))
    } catch (e) {
      setLoadError(e.message || 'Failed to load resume')
      setForm(null)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function handleSave(e) {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    setSaveError('')
    try {
      const payload = formToPayload(form)
      await apiFetch(`/resumes/${id}`, { method: 'PUT', json: payload })
      navigate(`/resume/${id}/preview`)
    } catch (err) {
      const msg =
        err.details?.fieldErrors || err.body?.details
          ? 'Please check required fields.'
          : err.message || 'Save failed'
      setSaveError(msg)
    } finally {
      setSaving(false)
    }
  }

  function patchField(field, value) {
    setForm((f) => (f ? { ...f, [field]: value } : f))
  }

  function patchItem(key, index, field, value) {
    setForm((f) => {
      if (!f) return f
      const arr = clone(f[key])
      arr[index] = { ...arr[index], [field]: value }
      return { ...f, [key]: arr }
    })
  }

  function addRow(key, empty) {
    setForm((f) => (f ? { ...f, [key]: [...f[key], empty()] } : f))
  }

  function removeRow(key, index) {
    setForm((f) => {
      if (!f) return f
      const arr = f[key].filter((_, i) => i !== index)
      return { ...f, [key]: arr }
    })
  }

  function applyAiSuggestion(field, value) {
    patchField(field, value)
  }

  if (loadError && !form) {
    return (
      <div className="app-shell">
        <p className="banner banner-error">{loadError}</p>
        <Link to="/dashboard" className="btn btn-secondary">
          Back to dashboard
        </Link>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="app-shell">
        <p className="app-loading">Loading editor...</p>
      </div>
    )
  }

  return (
    <div
      className="app-shell app-shell-editor"
      style={{ '--template-accent': form.designColor, '--template-font': form.designFont }}
    >
      <header className="app-header">
        <div>
          <h1 className="app-title">Edit resume</h1>
          <p className="app-sub">
            <Link to="/dashboard">Dashboard</Link>
            {' / '}
            <Link to={`/resume/${id}/preview`}>Preview</Link>
          </p>
        </div>
      </header>

      <TemplateStudio
        selectedTemplate={form.designTemplate}
        selectedColor={form.designColor}
        selectedFont={form.designFont}
        onTemplateChange={(value) => patchField('designTemplate', value)}
        onColorChange={(value) => patchField('designColor', value)}
        onFontChange={(value) => patchField('designFont', value)}
      />

      <div className={`editor-layout editor-layout-${form.designTemplate}`}>
        <ResumeAiAssistant form={form} onApplySuggestion={applyAiSuggestion} />

        <form className="editor-form" onSubmit={handleSave}>
          {saveError ? <p className="banner banner-error">{saveError}</p> : null}

          <fieldset className="card fieldset">
            <legend>Basics</legend>
            <label className="label">
              Document title
              <input
                className="input"
                value={form.title}
                onChange={(e) => patchField('title', e.target.value)}
                required
                maxLength={200}
              />
            </label>
            <label className="label">
              Resume type
              <select
                className="input"
                value={form.resumeType}
                onChange={(e) => patchField('resumeType', e.target.value)}
              >
                <option value="FRESHER">Fresher</option>
                <option value="EXPERIENCED">Experienced</option>
              </select>
            </label>
          </fieldset>

          <fieldset className="card fieldset">
            <legend>Personal &amp; contact (shown on resume)</legend>
            <div className="grid-2">
              <label className="label">
                Full name
                <input
                  className="input"
                  value={form.displayName}
                  onChange={(e) => patchField('displayName', e.target.value)}
                  required
                />
              </label>
              <label className="label">
                Email
                <input
                  className="input"
                  type="email"
                  value={form.displayEmail}
                  onChange={(e) => patchField('displayEmail', e.target.value)}
                  required
                />
              </label>
              <label className="label">
                Phone
                <input
                  className="input"
                  type="tel"
                  value={form.displayPhone}
                  onChange={(e) => patchField('displayPhone', e.target.value)}
                />
              </label>
              <label className="label">
                Address
                <input
                  className="input"
                  value={form.displayAddress}
                  onChange={(e) => patchField('displayAddress', e.target.value)}
                />
              </label>
              <label className="label">
                LinkedIn URL
                <input
                  className="input"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={form.linkedInUrl}
                  onChange={(e) => patchField('linkedInUrl', e.target.value)}
                />
              </label>
              <label className="label">
                GitHub URL
                <input
                  className="input"
                  type="url"
                  placeholder="https://github.com/..."
                  value={form.githubUrl}
                  onChange={(e) => patchField('githubUrl', e.target.value)}
                />
              </label>
            </div>
          </fieldset>

          {form.resumeType === 'FRESHER' ? (
            <fieldset className="card fieldset">
              <legend>Career objective</legend>
              <textarea
                className="input textarea"
                rows={4}
                value={form.objective}
                onChange={(e) => patchField('objective', e.target.value)}
                placeholder="What roles you want and what you bring."
              />
            </fieldset>
          ) : (
            <fieldset className="card fieldset">
              <legend>Professional summary</legend>
              <textarea
                className="input textarea"
                rows={5}
                value={form.professionalSummary}
                onChange={(e) => patchField('professionalSummary', e.target.value)}
                placeholder="Years of experience, domains, and standout impact."
              />
            </fieldset>
          )}

          <fieldset className="card fieldset">
            <legend>Education</legend>
            {form.educations.map((row, i) => (
              <div key={`ed-${i}`} className="repeat-block">
                <div className="repeat-head">
                  <span>Entry {i + 1}</span>
                  <button type="button" className="btn btn-ghost" onClick={() => removeRow('educations', i)}>
                    Remove
                  </button>
                </div>
                <div className="grid-2">
                  <label className="label">
                    Degree
                    <input
                      className="input"
                      value={row.degree}
                      onChange={(e) => patchItem('educations', i, 'degree', e.target.value)}
                    />
                  </label>
                  <label className="label">
                    Institution
                    <input
                      className="input"
                      value={row.institution}
                      onChange={(e) => patchItem('educations', i, 'institution', e.target.value)}
                    />
                  </label>
                  <label className="label">
                    Start
                    <input
                      className="input"
                      placeholder="YYYY-MM or text"
                      value={row.startDate}
                      onChange={(e) => patchItem('educations', i, 'startDate', e.target.value)}
                    />
                  </label>
                  <label className="label">
                    End
                    <input
                      className="input"
                      placeholder="YYYY-MM or Present"
                      value={row.endDate}
                      onChange={(e) => patchItem('educations', i, 'endDate', e.target.value)}
                    />
                  </label>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={() => addRow('educations', emptyEducation)}>
              Add education
            </button>
          </fieldset>

          <fieldset className="card fieldset">
            <legend>Experience</legend>
            {form.experiences.map((row, i) => (
              <div key={`ex-${i}`} className="repeat-block">
                <div className="repeat-head">
                  <span>Role {i + 1}</span>
                  <button type="button" className="btn btn-ghost" onClick={() => removeRow('experiences', i)}>
                    Remove
                  </button>
                </div>
                <div className="grid-2">
                  <label className="label">
                    Job title
                    <input
                      className="input"
                      value={row.jobTitle}
                      onChange={(e) => patchItem('experiences', i, 'jobTitle', e.target.value)}
                    />
                  </label>
                  <label className="label">
                    Company
                    <input
                      className="input"
                      value={row.company}
                      onChange={(e) => patchItem('experiences', i, 'company', e.target.value)}
                    />
                  </label>
                  <label className="label">
                    Location
                    <input
                      className="input"
                      value={row.location}
                      onChange={(e) => patchItem('experiences', i, 'location', e.target.value)}
                    />
                  </label>
                  <label className="label">
                    Start
                    <input
                      className="input"
                      value={row.startDate}
                      onChange={(e) => patchItem('experiences', i, 'startDate', e.target.value)}
                    />
                  </label>
                  <label className="label">
                    End
                    <input
                      className="input"
                      value={row.endDate}
                      onChange={(e) => patchItem('experiences', i, 'endDate', e.target.value)}
                    />
                  </label>
                </div>
                <label className="label">
                  Responsibilities &amp; impact
                  <textarea
                    className="input textarea"
                    rows={4}
                    value={row.responsibilities}
                    onChange={(e) => patchItem('experiences', i, 'responsibilities', e.target.value)}
                  />
                </label>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => addRow('experiences', emptyExperience)}
            >
              Add experience
            </button>
          </fieldset>

          <fieldset className="card fieldset">
            <legend>Skills</legend>
            {form.skills.map((row, i) => (
              <div key={`sk-${i}`} className="repeat-block">
                <div className="repeat-head">
                  <span>Skill {i + 1}</span>
                  <button type="button" className="btn btn-ghost" onClick={() => removeRow('skills', i)}>
                    Remove
                  </button>
                </div>
                <div className="grid-2">
                  <label className="label">
                    Name
                    <input
                      className="input"
                      value={row.skillName}
                      onChange={(e) => patchItem('skills', i, 'skillName', e.target.value)}
                    />
                  </label>
                  <label className="label">
                    Proficiency
                    <input
                      className="input"
                      placeholder="e.g. Advanced"
                      value={row.proficiency}
                      onChange={(e) => patchItem('skills', i, 'proficiency', e.target.value)}
                    />
                  </label>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={() => addRow('skills', emptySkill)}>
              Add skill
            </button>
          </fieldset>

          <fieldset className="card fieldset">
            <legend>Certifications</legend>
            {form.certifications.map((row, i) => (
              <div key={`ce-${i}`} className="repeat-block">
                <div className="repeat-head">
                  <span>Certification {i + 1}</span>
                  <button type="button" className="btn btn-ghost" onClick={() => removeRow('certifications', i)}>
                    Remove
                  </button>
                </div>
                <div className="grid-2">
                  <label className="label">
                    Name
                    <input
                      className="input"
                      value={row.certificationName}
                      onChange={(e) => patchItem('certifications', i, 'certificationName', e.target.value)}
                    />
                  </label>
                  <label className="label">
                    Issuing organization
                    <input
                      className="input"
                      value={row.issuingOrganization}
                      onChange={(e) => patchItem('certifications', i, 'issuingOrganization', e.target.value)}
                    />
                  </label>
                  <label className="label">
                    Issue date
                    <input
                      className="input"
                      value={row.issueDate}
                      onChange={(e) => patchItem('certifications', i, 'issueDate', e.target.value)}
                    />
                  </label>
                  <label className="label">
                    Expiry date
                    <input
                      className="input"
                      value={row.expiryDate}
                      onChange={(e) => patchItem('certifications', i, 'expiryDate', e.target.value)}
                    />
                  </label>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => addRow('certifications', emptyCertification)}
            >
              Add certification
            </button>
          </fieldset>

          <fieldset className="card fieldset">
            <legend>Projects</legend>
            {form.projects.map((row, i) => (
              <div key={`pr-${i}`} className="repeat-block">
                <div className="repeat-head">
                  <span>Project {i + 1}</span>
                  <button type="button" className="btn btn-ghost" onClick={() => removeRow('projects', i)}>
                    Remove
                  </button>
                </div>
                <label className="label">
                  Name
                  <input
                    className="input"
                    value={row.name}
                    onChange={(e) => patchItem('projects', i, 'name', e.target.value)}
                  />
                </label>
                <label className="label">
                  Description
                  <textarea
                    className="input textarea"
                    rows={3}
                    value={row.description}
                    onChange={(e) => patchItem('projects', i, 'description', e.target.value)}
                  />
                </label>
                <div className="grid-2">
                  <label className="label">
                    Link
                    <input
                      className="input"
                      type="url"
                      value={row.link}
                      onChange={(e) => patchItem('projects', i, 'link', e.target.value)}
                    />
                  </label>
                  <label className="label">
                    Tech stack
                    <input
                      className="input"
                      value={row.techStack}
                      onChange={(e) => patchItem('projects', i, 'techStack', e.target.value)}
                    />
                  </label>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={() => addRow('projects', emptyProject)}>
              Add project
            </button>
          </fieldset>

          <fieldset className="card fieldset">
            <legend>Internships / training</legend>
            {form.internships.map((row, i) => (
              <div key={`in-${i}`} className="repeat-block">
                <div className="repeat-head">
                  <span>Internship {i + 1}</span>
                  <button type="button" className="btn btn-ghost" onClick={() => removeRow('internships', i)}>
                    Remove
                  </button>
                </div>
                <div className="grid-2">
                  <label className="label">
                    Company / org
                    <input
                      className="input"
                      value={row.company}
                      onChange={(e) => patchItem('internships', i, 'company', e.target.value)}
                    />
                  </label>
                  <label className="label">
                    Role
                    <input
                      className="input"
                      value={row.role}
                      onChange={(e) => patchItem('internships', i, 'role', e.target.value)}
                    />
                  </label>
                  <label className="label">
                    Duration
                    <input
                      className="input"
                      value={row.duration}
                      onChange={(e) => patchItem('internships', i, 'duration', e.target.value)}
                    />
                  </label>
                </div>
                <label className="label">
                  Description
                  <textarea
                    className="input textarea"
                    rows={3}
                    value={row.description}
                    onChange={(e) => patchItem('internships', i, 'description', e.target.value)}
                  />
                </label>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={() => addRow('internships', emptyInternship)}>
              Add internship
            </button>
          </fieldset>

          <fieldset className="card fieldset">
            <legend>Achievements</legend>
            {form.achievements.map((row, i) => (
              <div key={`ac-${i}`} className="repeat-block">
                <div className="repeat-head">
                  <span>Achievement {i + 1}</span>
                  <button type="button" className="btn btn-ghost" onClick={() => removeRow('achievements', i)}>
                    Remove
                  </button>
                </div>
                <textarea
                  className="input textarea"
                  rows={2}
                  value={row.content}
                  onChange={(e) => patchItem('achievements', i, 'content', e.target.value)}
                />
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={() => addRow('achievements', emptyLine)}>
              Add achievement
            </button>
          </fieldset>

          <fieldset className="card fieldset">
            <legend>Extra-curricular activities</legend>
            {form.extracurriculars.map((row, i) => (
              <div key={`extra-${i}`} className="repeat-block">
                <div className="repeat-head">
                  <span>Activity {i + 1}</span>
                  <button type="button" className="btn btn-ghost" onClick={() => removeRow('extracurriculars', i)}>
                    Remove
                  </button>
                </div>
                <textarea
                  className="input textarea"
                  rows={2}
                  value={row.content}
                  onChange={(e) => patchItem('extracurriculars', i, 'content', e.target.value)}
                />
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => addRow('extracurriculars', emptyLine)}
            >
              Add activity
            </button>
          </fieldset>

          <div className="sticky-actions">
            <Link to="/dashboard" className="btn btn-ghost">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save & preview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
