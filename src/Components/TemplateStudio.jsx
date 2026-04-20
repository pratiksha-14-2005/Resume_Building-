import React from 'react'

const TEMPLATE_OPTIONS = [
  {
    id: 'classic',
    name: 'Classic Split',
    role: 'Clean sidebar layout',
    accent: '#0f4c75',
  },
  {
    id: 'modern',
    name: 'Modern Blocks',
    role: 'Balanced professional layout',
    accent: '#8b3d52',
  },
  {
    id: 'elegant',
    name: 'Elegant Edge',
    role: 'Soft editorial layout',
    accent: '#d79ce8',
  },
  {
    id: 'minimal',
    name: 'Minimal Pro',
    role: 'Light and airy layout',
    accent: '#9db6df',
  },
]

const COLOR_OPTIONS = ['#0f4c75', '#8b3d52', '#d79ce8', '#2563eb', '#f59e0b', '#10b981', '#1f2937']

const FONT_OPTIONS = [
  { id: 'Inter, sans-serif', label: 'Inter' },
  { id: 'Georgia, serif', label: 'Georgia' },
  { id: '"Trebuchet MS", sans-serif', label: 'Trebuchet' },
  { id: '"Gill Sans", sans-serif', label: 'Gill Sans' },
]

export default function TemplateStudio({
  selectedTemplate,
  selectedColor,
  selectedFont,
  onTemplateChange,
  onColorChange,
  onFontChange,
}) {
  return (
    <section className="card template-studio">
      <div className="template-studio-head">
        <div>
          <p className="template-kicker">Design Studio</p>
          <h2>Pick a resume template</h2>
          <p className="muted">
            Choose a structure, set the accent color, and switch fonts before you continue editing.
          </p>
        </div>
        <div className="template-tools">
          <button type="button" className="template-tool-btn" title="Edit layout">
            ED
          </button>
          <button type="button" className="template-tool-btn" title="Change color">
            CL
          </button>
          <button type="button" className="template-tool-btn" title="Change font">
            FT
          </button>
        </div>
      </div>

      <div className="template-grid">
        {TEMPLATE_OPTIONS.map((template) => (
          <button
            key={template.id}
            type="button"
            className={`template-card ${
              selectedTemplate === template.id ? 'template-card-active' : ''
            }`}
            onClick={() => onTemplateChange(template.id)}
          >
            <div className="template-card-preview" style={{ '--template-preview-accent': template.accent }}>
              {template.id === 'classic' ? (
                <>
                  <div className="template-preview-sidebar" />
                  <div className="template-preview-body">
                    <div className="template-preview-line template-preview-line-lg" />
                    <div className="template-preview-line" />
                    <div className="template-preview-group">
                      <div className="template-preview-line template-preview-line-sm" />
                      <div className="template-preview-line" />
                      <div className="template-preview-line" />
                    </div>
                  </div>
                </>
              ) : null}
              {template.id === 'modern' ? (
                <div className="template-preview-stack">
                  <div className="template-preview-banner" />
                  <div className="template-preview-blocks">
                    <div className="template-preview-tile" />
                    <div className="template-preview-tile" />
                    <div className="template-preview-tile template-preview-tile-wide" />
                  </div>
                </div>
              ) : null}
              {template.id === 'elegant' ? (
                <div className="template-preview-columns">
                  <div className="template-preview-column-main">
                    <div className="template-preview-line template-preview-line-lg" />
                    <div className="template-preview-line" />
                    <div className="template-preview-line" />
                  </div>
                  <div className="template-preview-column-side">
                    <div className="template-preview-chip" />
                    <div className="template-preview-chip" />
                    <div className="template-preview-chip" />
                  </div>
                </div>
              ) : null}
              {template.id === 'minimal' ? (
                <div className="template-preview-minimal">
                  <div className="template-preview-avatar" />
                  <div className="template-preview-minimal-body">
                    <div className="template-preview-line template-preview-line-lg" />
                    <div className="template-preview-line" />
                    <div className="template-preview-line" />
                    <div className="template-preview-line template-preview-line-sm" />
                  </div>
                </div>
              ) : null}
            </div>
            <div className="template-card-meta">
              <strong>{template.name}</strong>
              <span>{template.role}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="template-controls">
        <div className="template-control-group">
          <p className="template-control-label">Accent color</p>
          <div className="template-swatches">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                className={`template-swatch ${selectedColor === color ? 'template-swatch-active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => onColorChange(color)}
                aria-label={`Use color ${color}`}
              />
            ))}
          </div>
        </div>

        <div className="template-control-group">
          <p className="template-control-label">Font style</p>
          <div className="template-fonts">
            {FONT_OPTIONS.map((font) => (
              <button
                key={font.id}
                type="button"
                className={`template-font-btn ${selectedFont === font.id ? 'template-font-btn-active' : ''}`}
                style={{ fontFamily: font.id }}
                onClick={() => onFontChange(font.id)}
              >
                {font.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
