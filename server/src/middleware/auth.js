import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export function requireAuth(req, res, next) {
  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'Server misconfiguration' })
  }
  const token = req.cookies?.token
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.sub
    next()
  } catch {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}
