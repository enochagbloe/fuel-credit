const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const router = express.Router()
const prisma = new PrismaClient()

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Helper function to generate tokens
const generateTokens = (userId) => {
  const jwtSecret = process.env.JWT_SECRET
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET
  
  if (!jwtSecret || !jwtRefreshSecret) {
    throw new Error('JWT secrets are not configured')
  }

  const accessToken = jwt.sign(
    { userId },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  )
  
  const refreshToken = jwt.sign(
    { userId },
    jwtRefreshSecret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  )
  
  return { accessToken, refreshToken }
}

// Authentication middleware
const authenticateToken = async (req, res, next) => {
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
    const decoded = jwt.verify(token, jwtSecret)
    
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
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}

// Register new user
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    })
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user and fuel account in transaction
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
      tokens: {
        accessToken,
        refreshToken,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Login user
router.post('/login', authLimiter, async (req, res) => {
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
      tokens: {
        accessToken,
        refreshToken,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user })
})

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
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


// List all users (admin only)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    // Optionally, check if req.user is admin here
    const users = await prisma.user.findMany({
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
    res.json({ users })
  } catch (error) {
    console.error('List users error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = router