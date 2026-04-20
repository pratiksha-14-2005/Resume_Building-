import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'



const router = Router()

const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().nullable(),
  password: z.string().min(8).max(128),
})

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(128),
})

const profileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(40).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128),
})

function setAuthCookie(res, userId) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET missing')
  const token = jwt.sign({ sub: userId }, secret, { expiresIn: '7d' })
  const secure = process.env.COOKIE_SECURE === 'true'
  res.cookie('token', token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  })
}

function getAuthUserId(req) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET missing')
  const token = req.cookies?.token
  if (!token) return null
  try {
    const payload = jwt.verify(token, secret)
    return payload.sub
  } catch {
    return null
  }
}

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  }
  const { name, email, phone, password } = parsed.data
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' })
  }
  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      phone: phone || null,
      passwordHash,
    },
    select: { id: true, email: true, name: true, phone: true, address: true, createdAt: true },
  })
  setAuthCookie(res, user.id)
  return res.status(201).json({ user })
})

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  }
  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  setAuthCookie(res, user.id)
  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt,
    },
  })
})

router.post('/logout', (_req, res) => {
  const secure = process.env.COOKIE_SECURE === 'true'
  res.clearCookie('token', { path: '/', httpOnly: true, secure, sameSite: 'lax' })
  return res.json({ ok: true })
})

router.get('/me', async (req, res) => {
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'Server misconfiguration' })
  }
  const userId = getAuthUserId(req)
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, phone: true, address: true, createdAt: true },
  })
  if (!user) {
    res.clearCookie('token', { path: '/' })
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return res.json({ user })
})

router.patch('/profile', async (req, res) => {
  const userId = getAuthUserId(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const parsed = profileSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  }

  const { name, phone, address } = parsed.data
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      phone: phone || null,
      address: address || null,
    },
    select: { id: true, email: true, name: true, phone: true, address: true, createdAt: true },
  })

  return res.json({ user })
})

router.post('/change-password', async (req, res) => {
  const userId = getAuthUserId(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const parsed = changePasswordSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  }

  const { currentPassword, newPassword } = parsed.data
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const ok = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!ok) {
    return res.status(401).json({ error: 'Current password is incorrect' })
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({ error: 'New password must be different' })
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  })

  return res.json({ ok: true })
})

export default router
