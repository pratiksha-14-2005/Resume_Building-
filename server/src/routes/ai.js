import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const assistantRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(1200),
  action: z.enum(['general', 'objective', 'professionalSummary', 'skills']).optional(),
  resume: z
    .object({
      title: z.string().optional(),
      resumeType: z.enum(['FRESHER', 'EXPERIENCED']).optional(),
      displayName: z.string().optional(),
      educations: z.array(z.object({ degree: z.string().optional(), institution: z.string().optional() })).optional(),
      experiences: z
        .array(
          z.object({
            jobTitle: z.string().optional(),
            company: z.string().optional(),
            responsibilities: z.string().optional(),
          }),
        )
        .optional(),
      skills: z.array(z.object({ skillName: z.string().optional(), proficiency: z.string().optional() })).optional(),
      projects: z
        .array(
          z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            techStack: z.string().optional(),
          }),
        )
        .optional(),
      objective: z.string().optional(),
      professionalSummary: z.string().optional(),
      achievements: z.array(z.object({ content: z.string().optional() })).optional(),
      extracurriculars: z.array(z.object({ content: z.string().optional() })).optional(),
    })
    .passthrough(),
})

const ACTION_HINTS = {
  general:
    'Answer the user with crisp help for resume writing, interview preparation, role knowledge, project explanation, or career doubts. Include a suggestion only if the user clearly asks for text to place into the resume.',
  objective:
    'Write a strong, ATS-friendly fresher career objective. Include a suggestion targeted to the objective field.',
  professionalSummary:
    'Write a concise, impact-focused professional summary. Include a suggestion targeted to the professionalSummary field.',
  skills: 'Suggest stronger resume-ready skills phrasing and grouping. Do not invent tools unless strongly implied.',
}

router.use(requireAuth)

router.post('/resume-assistant', async (req, res) => {
  const parsed = assistantRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error: 'AI assistant is not configured yet. Add OPENAI_API_KEY in server/.env and restart the server.',
    })
  }

  const { prompt, action = 'general', resume } = parsed.data
  const model = process.env.OPENAI_MODEL || 'gpt-5.4-mini'

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        reasoning: { effort: 'low' },
        text: { format: { type: 'json_object' } },
        input: [
          {
            role: 'developer',
            content: [
              {
                type: 'input_text',
                text:
                  'You are an AI career assistant inside a resume builder. Respond in valid JSON with keys: reply, suggestionTitle, targetField, suggestedText, followUps. ' +
                  'reply must be a short helpful answer. suggestionTitle and suggestedText are optional strings. ' +
                  'targetField must be one of objective, professionalSummary, or an empty string. followUps must be an array of at most 3 short strings. ' +
                  'Do not use markdown. Do not wrap JSON in code fences. Keep suggestedText truthful and tailored only to the provided resume context. ' +
                  'You may answer general interview, career, and resume questions even when no direct field suggestion is needed.',
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: JSON.stringify({
                  task: prompt,
                  action,
                  actionHint: ACTION_HINTS[action] || ACTION_HINTS.general,
                  resume,
                }),
              },
            ],
          },
        ],
      }),
    })

    const data = await response.json().catch(() => null)
    if (!response.ok) {
      const message = data?.error?.message || 'AI request failed'
      return res.status(response.status).json({ error: message })
    }

    const rawText =
      data?.output_text ||
      data?.output
        ?.flatMap((item) => item.content || [])
        ?.filter((item) => item.type === 'output_text')
        ?.map((item) => item.text)
        ?.join('\n')

    if (!rawText) {
      return res.status(502).json({ error: 'AI assistant returned an empty response' })
    }

    let parsedBody
    try {
      parsedBody = JSON.parse(rawText)
    } catch {
      return res.status(502).json({ error: 'AI assistant returned an unreadable response' })
    }

    return res.json({
      reply: typeof parsedBody.reply === 'string' ? parsedBody.reply : 'I could not prepare a usable answer yet.',
      suggestionTitle:
        typeof parsedBody.suggestionTitle === 'string' ? parsedBody.suggestionTitle : '',
      targetField:
        parsedBody.targetField === 'objective' || parsedBody.targetField === 'professionalSummary'
          ? parsedBody.targetField
          : '',
      suggestedText: typeof parsedBody.suggestedText === 'string' ? parsedBody.suggestedText : '',
      followUps: Array.isArray(parsedBody.followUps)
        ? parsedBody.followUps.filter((item) => typeof item === 'string').slice(0, 3)
        : [],
      model,
    })
  } catch (error) {
    console.error('AI route failed', error)
    return res.status(500).json({ error: 'Failed to contact AI assistant' })
  }
})

export default router
