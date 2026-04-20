import React, { useMemo, useState } from 'react'
import { apiFetch } from '../api'
import { formToPayload } from '../utils/resumeForm'

const ASSISTANT_MODES = [
  {
    id: 'resume',
    label: 'Resume Help',
    icon: 'RH',
    prompt: 'Improve this resume for the target role.',
    helper: 'Summary, skills, structure, and wording.',
  },
  {
    id: 'interview',
    label: 'Interview',
    icon: 'IQ',
    prompt: 'Ask interview questions based on this resume.',
    helper: 'Practice answers and role-fit questions.',
  },
  {
    id: 'doubts',
    label: 'Ask Anything',
    icon: 'QA',
    prompt: 'Help me with my doubts about resume writing, jobs, and interview preparation.',
    helper: 'Any question related to career preparation.',
  },
]

export default function ResumeAiAssistant({ form, onApplySuggestion }) {
  const [isOpen, setIsOpen] = useState(true)
  const [mode, setMode] = useState('resume')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        'Ask me anything about resume writing, interview preparation, career doubts, project explanations, or role-specific preparation.',
      followUps: [
        'What should I improve first in this resume?',
        'Ask me 5 interview questions based on this profile.',
      ],
      suggestion: null,
    },
  ])

  const selectedMode = useMemo(
    () => ASSISTANT_MODES.find((item) => item.id === mode) || ASSISTANT_MODES[0],
    [mode],
  )

  async function sendMessage(nextPrompt, action = 'general') {
    const cleanPrompt = nextPrompt.trim()
    if (!cleanPrompt) return

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: cleanPrompt,
    }

    setLoading(true)
    setError('')
    setMessages((current) => [...current, userMessage])

    try {
      const data = await apiFetch('/ai/resume-assistant', {
        method: 'POST',
        json: {
          prompt: `[${selectedMode.label}] ${cleanPrompt}`,
          action,
          resume: formToPayload(form),
        },
      })

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: data.reply,
          followUps: data.followUps || [],
          suggestion:
            data.targetField && data.suggestedText
              ? {
                  title:
                    data.suggestionTitle ||
                    (data.targetField === 'objective'
                      ? 'Suggested objective'
                      : 'Suggested professional summary'),
                  targetField: data.targetField,
                  text: data.suggestedText,
                }
              : null,
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
    <aside className={`ai-sidebar card ${isOpen ? 'ai-sidebar-open' : 'ai-sidebar-collapsed'}`}>
      <div className="ai-sidebar-head">
        <div>
          <p className="ai-kicker">AI Assistant</p>
          <h2>Career Copilot</h2>
          <p className="ai-subcopy">
            Resume help, interview prep, role information, and doubt solving in one panel.
          </p>
        </div>
        <div className="ai-head-actions">
          <span className="ai-status">{loading ? 'Thinking...' : 'Ready'}</span>
          <button
            type="button"
            className="ai-toggle"
            onClick={() => setIsOpen((current) => !current)}
            aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
            title={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
          >
            {isOpen ? 'x' : '+'}
          </button>
        </div>
      </div>

      {isOpen ? (
        <>
          <div className="ai-mode-list">
            {ASSISTANT_MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`ai-mode-btn ${mode === item.id ? 'ai-mode-btn-active' : ''}`}
                disabled={loading}
                onClick={() => {
                  setMode(item.id)
                  setPrompt(item.prompt)
                }}
              >
                <span className="ai-mode-icon">{item.icon}</span>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.helper}</small>
                </span>
              </button>
            ))}
          </div>

          <div className="ai-chat" aria-live="polite">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`ai-message ${message.role === 'user' ? 'ai-message-user' : 'ai-message-assistant'}`}
              >
                <p className="ai-message-role">{message.role === 'user' ? 'You' : 'Assistant'}</p>
                <p className="ai-message-text">{message.text}</p>

                {message.suggestion ? (
                  <div className="ai-suggestion">
                    <p className="ai-suggestion-title">{message.suggestion.title}</p>
                    <p className="ai-suggestion-text">{message.suggestion.text}</p>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() =>
                        onApplySuggestion(message.suggestion.targetField, message.suggestion.text)
                      }
                    >
                      Apply to{' '}
                      {message.suggestion.targetField === 'objective'
                        ? 'objective'
                        : 'professional summary'}
                    </button>
                  </div>
                ) : null}

                {message.followUps?.length ? (
                  <div className="ai-followups">
                    {message.followUps.map((followUp) => (
                      <button
                        key={followUp}
                        type="button"
                        className="ai-followup-btn"
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

          <form className="ai-form" onSubmit={handleSubmit}>
            <label className="label" htmlFor="ai-prompt">
              Ask any question about resume or interview preparation
              <textarea
                id="ai-prompt"
                className="input textarea"
                rows={4}
                placeholder="Example: Ask me backend interview questions, improve my resume headline, or explain what recruiters expect for this role."
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                disabled={loading}
              />
            </label>
            {error ? <p className="banner banner-error">{error}</p> : null}
            <div className="ai-form-actions">
              <span className="ai-context-note">Resume context is included automatically</span>
              <button type="submit" className="btn btn-primary" disabled={loading || !prompt.trim()}>
                {loading ? 'Generating...' : 'Send'}
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="ai-closed">
          <span className="ai-closed-icon">AI</span>
          <p>Open assistant</p>
        </div>
      )}
    </aside>
  )
}
