import type { Request, Response, NextFunction } from 'express'
import { verifyToken, type JWTPayload } from '../utils/jwt.ts'

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload
}

export const authenticatedToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers['authorization']
    // get the token
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Bad Request' })
    }

    const payload = await verifyToken(token)
    req.user = payload
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden' })
  }
}
