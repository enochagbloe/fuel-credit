/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import jwt from 'jsonwebtoken'

import type { NextFunction, Request, Response } from 'express'

// Load environment variables
dotenv.config()

// Initialize Prisma
const prisma = new PrismaClient()

// Create Express application
const app = express()
const PORT = process.env.PORT || 3000

// Extend Request type for user
interface AuthRequest extends Request {
  user?: any
}

// Security middleware
app.use(helmet())
app.use(cors({
  origin: ['http://localhost:3000', 'exp://localhost:19000'],
  credentials: true,
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP',
})
app.use(limiter)

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Helper: Generate tokens
const generateTokens = (userId: string) => {
  const jwtSecret = process.env.JWT_SECRET
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET
  
  if (!jwtSecret || !jwtRefreshSecret) {
    throw new Error('JWT secrets not configured')
  }

  const accessToken = jwt.sign({ userId }, jwtSecret, { expiresIn: '24h' })
  const refreshToken = jwt.sign({ userId }, jwtRefreshSecret, { expiresIn: '7d' })
  
  return { accessToken, refreshToken }
}

// Middleware: Authenticate token
const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Access token required' })
  }

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    return res.status(500).json({ message: 'Server configuration error' })
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as any
    
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

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = user
    next()
  } catch (error: any) {
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}

// ==================== ROUTES ====================

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Fuel Credit System API',
    version: '1.0.0',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me',
      logout: 'POST /api/auth/logout',
      health: 'GET /health'
    }
  })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    })
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user and fuel account
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          firstName,
          lastName,
        },
      })

      const fuelAccount = await tx.fuelAccount.create({
        data: {
          userId: user.id,
          balance: 0.00,
          creditLimit: 1000.00,
        },
      })

      return { user, fuelAccount }
    })

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(result.user.id)

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: result.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        fuelAccount: {
          id: result.fuelAccount.id,
          balance: result.fuelAccount.balance,
          creditLimit: result.fuelAccount.creditLimit,
        }
      },
      tokens: { accessToken, refreshToken },
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { 
        fuelAccount: {
          select: {
            id: true,
            balance: true,
            creditLimit: true,
            status: true
          }
        } 
      },
    })

    if (!user || !user.passwordHash) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id)

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fuelAccount: user.fuelAccount,
      },
      tokens: { accessToken, refreshToken },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get current user
app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res) => {
  res.json({ user: req.user })
})

// Logout
app.post('/api/auth/logout', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { refreshToken } = req.body

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      })
    }

    res.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`API endpoints: http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})