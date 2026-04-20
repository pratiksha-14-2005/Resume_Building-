import React, { useMemo, useState } from 'react'
import { apiFetch } from '../api'

const ASSISTANT_MODES = [
  {
    id: 'interview',
    label: 'Interview',
    icon: 'IQ',
    prompt: 'Ask interview questions for this resume and role.',
    helper: 'Mock questions, answer framing, and confidence building.',
  },
  {
    id: 'information',
    label: 'Info',
    icon: 'IN',
    prompt: 'Explain what I should know to perform better in this target role.',
    helper: 'Concepts, role knowledge, and learning guidance.',
  },
  {
    id: 'doubts',
    label: 'Doubts',
    icon: 'DS',
    prompt: 'Help me clear my doubts about resume quality and job preparation.',
    helper: 'Ask anything and get practical explanations.',
  },
]

function buildResumeContext(resume) {
  return {
    title: resume.title,
    resumeType: resume.resumeType,
    displayName: resume.displayName,
    objective: resume.objective,
    professionalSummary: resume.professionalSummary,
    educations: (resume.educations || []).map((item) => ({
      degree: item.degree,
      institution: item.institution,
    })),
    experiences: (resume.experiences || []).map((item) => ({
      jobTitle: item.jobTitle,
      company: item.company,
      responsibilities: item.responsibilities,
    })),
    skills: (resume.skills || []).map((item) => ({
      skillName: item.skillName,
      proficiency: item.proficiency,
    })),
    projects: (resume.projects || []).map((item) => ({
      name: item.name,
      description: item.description,
      techStack: item.techStack,
    })),
  }
}

export default function CareerAiPanel({ resume }) {
  const [mode, setMode] = useState('interview')
  const [isOpen, setIsOpen] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        'I can help with interview preparation, role information, resume doubts, and job-readiness questions based on this resume.',
      followUps: [
        'Ask me the top 5 interview questions for this resume.',
        'What should I improve before applying?',
      ],
    },
  ])

  const selectedMode = useMemo(
    () => ASSISTANT_MODES.find((item) => item.id === mode) || ASSISTANT_MODES[0],
    [mode],
  )

  async function sendMessage(rawPrompt) {
    const cleanPrompt = rawPrompt.trim()
    if (!cleanPrompt) return

    setLoading(true)
    setError('')
    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        text: cleanPrompt,
      },
    ])

    try {
      const data = await apiFetch('/ai/resume-assistant', {
        method: 'POST',
        json: {
          prompt: `[${selectedMode.label}] ${cleanPrompt}`,
          action: 'general',
          resume: buildResumeContext(resume),
        },
      })

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: data.reply,
          followUps: data.followUps || [],
        },
      ])
      setPrompt('')
    } catch (err) {
      setError(err.message || 'AI assistant failed')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    sendMessage(prompt)
  }

  return (
    <aside className={`career-ai ${isOpen ? 'career-ai-open' : 'career-ai-collapsed'}`}>
      <div className="career-ai-shell card">
        <div className="career-ai-top">
          <div>
            <p className="career-ai-kicker">AI Assistant</p>
            <h2 className="career-ai-title">Career Copilot</h2>
            <p className="career-ai-copy">
              Interview preparation, information support, and doubt solving in one workspace.
            </p>
          </div>
          <button
            type="button"
            className="career-ai-toggle"
            onClick={() => setIsOpen((current) => !current)}
            aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
            title={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
          >
            {isOpen ? 'x' : '+'}
          </button>
        </div>

        {isOpen ? (
          <>
            <div className="career-ai-modes">
              {ASSISTANT_MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`career-ai-mode ${mode === item.id ? 'career-ai-mode-active' : ''}`}
                  onClick={() => {
                    setMode(item.id)
                    setPrompt(item.prompt)
                  }}
                >
                  <span className="career-ai-mode-icon">{item.icon}</span>
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.helper}</small>
                  </span>
                </button>
              ))}
            </div>

            <div className="career-ai-hint">
              <span className="career-ai-hint-badge">Live</span>
              <p>
                You can ask any question here. This assistant uses your resume context to answer like
                a preparation coach.
              </p>
            </div>

            <div className="career-ai-chat" aria-live="polite">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`career-ai-bubble ${
                    message.role === 'user' ? 'career-ai-bubble-user' : 'career-ai-bubble-assistant'
                  }`}
                >
                  <p className="career-ai-role">{message.role === 'user' ? 'You' : 'Copilot'}</p>
                  <p className="career-ai-text">{message.text}</p>
                  {message.followUps?.length ? (
                    <div className="career-ai-followups">
                      {message.followUps.map((followUp) => (
                        <button
                          key={followUp}
                          type="button"
                          className="career-ai-followup"
                          disabled={loading}
                          onClick={() => sendMessage(followUp)}
                        >
                          {followUp}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>

            <form className="career-ai-form" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="career-ai-prompt">
                Ask the AI assistant
              </label>
              <textarea
                id="career-ai-prompt"
                className="input textarea"
                rows={4}
                placeholder="Ask about interviews, technology, projects, doubts, or job readiness..."
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                disabled={loading}
              />
              {error ? <p className="banner banner-error">{error}</p> : null}
              <div className="career-ai-actions">
                <span className="career-ai-permission">Context enabled for this resume</span>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !prompt.trim()}
                >
                  {loading ? 'Thinking...' : 'Send'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="career-ai-closed">
            <span className="career-ai-closed-icon">AI</span>
            <p>Open assistant</p>
          </div>
        )}
      </div>
    </aside>
  )
}
