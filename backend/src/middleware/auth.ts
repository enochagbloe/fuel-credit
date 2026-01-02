/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../lib/db'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    firstName: string
    lastName: string
    fuelAccount: {
      id: string
      balance: number
      creditLimit: number
      status: string
    } | null
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      res.status(401).json({ message: 'Access token required' })
      return
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      res.status(500).json({ message: 'Server configuration error' })
      return
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        fuelAccount: {
          select: {
            id: true,
            balance: true,
            creditLimit: true,
            status: true
          }
        }
      }
    })

    if (!user) {
      res.status(401).json({ message: 'User not found' })
      return
    }

    ;(req as AuthRequest).user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fuelAccount: user.fuelAccount
        ? {
            id: user.fuelAccount.id,
            balance: Number(user.fuelAccount.balance),
            creditLimit: Number(user.fuelAccount.creditLimit),
            status: user.fuelAccount.status.toString()
          }
        : null
    }

    next()
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' })
  }
}

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token) {
    const jwtSecret = process.env.JWT_SECRET
    if (jwtSecret) {
      try {
        const decoded = jwt.verify(token, jwtSecret) as { userId: string }
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isVerified: true,
            fuelAccount: {
              select: {
                id: true,
                balance: true,
                creditLimit: true,
                status: true
              }
            }
          }
        })

        if (user) {
          req.user = {
            ...user,
            fuelAccount: user.fuelAccount
              ? {
                  id: user.fuelAccount.id,
                  balance: Number(user.fuelAccount.balance),
                  creditLimit: Number(user.fuelAccount.creditLimit),
                  status: user.fuelAccount.status
                }
              : null
          }
        }
      } catch {
        // Continue without user if token is invalid
      }
    }
  }

  next()
}