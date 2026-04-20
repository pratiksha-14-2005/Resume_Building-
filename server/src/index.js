import './env.js'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.js'
import aiRoutes from './routes/ai.js'
import { prisma } from './lib/prisma.js'
import resumeRoutes from './routes/resumes.js'
// app.use(helmet());

const app = express()
const PORT = Number(process.env.PORT) || 3001
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
const isProduction = process.env.NODE_ENV === 'production'

app.set('trust proxy', 1)
app.disable('x-powered-by')

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'same-origin' },
    referrerPolicy: { policy: 'no-referrer' },
    hsts: isProduction
      ? {
          maxAge: 15552000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://images.unsplash.com'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        workerSrc: ["'self'", 'blob:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  }),
)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
})
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api', apiLimiter)
app.use('/api/resumes', resumeRoutes)
app.use('/api/ai', aiRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'resume-builder-api' })
})

if (!isProduction) {
  app.get('/api', (_req, res) => {
    res.json({
      ok: true,
      message: 'API is running',
      routes: ['/api/health', '/api/debug/users', '/api/debug/resumes'],
    })
  })

  app.get('/api/debug/users', async (_req, res, next) => {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          createdAt: true,
        },
      })
      res.json({ count: users.length, users })
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/debug/resumes', async (_req, res, next) => {
    try {
      const resumes = await prisma.resume.findMany({
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          resumeType: true,
          userId: true,
          displayName: true,
          updatedAt: true,
        },
      })
      res.json({ count: resumes.length, resumes })
    } catch (error) {
      next(error)
    }
  })
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
if (isProduction) {
  const distPath = path.join(__dirname, '../../dist')
  app.use(express.static(distPath, { index: false }))
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) next(err)
    })
  })
}

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' })
  }
  if (isProduction) {
    return res.status(404).send('Not found')
  }
  return res.status(404).send('Not found')
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({
    error: 'Internal server error',
    details: isProduction ? undefined : err?.message || String(err),
  })
})

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
})
