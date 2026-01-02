const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

// Initialize
const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3000

// ==================== MIDDLEWARE ====================
app.use(helmet())
app.use(cors({
  origin: ['http://localhost:3000', 'exp://localhost:19000', 'http://localhost:8081'],
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ==================== HELPER FUNCTIONS ====================
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  )
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  )
  
  return { accessToken, refreshToken }
}

// Auth middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
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

// ==================== ROUTES ====================

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Fuel Credit System API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout'
      }
    }
  })
})

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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
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

    console.log(`✅ User registered: ${result.user.email}`)

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        fuelAccount: {
          id: result.fuelAccount.id,
          balance: Number(result.fuelAccount.balance),
          creditLimit: Number(result.fuelAccount.creditLimit),
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

    console.log(`✅ User logged in: ${user.email}`)

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fuelAccount: user.fuelAccount ? {
          id: user.fuelAccount.id,
          balance: Number(user.fuelAccount.balance),
          creditLimit: Number(user.fuelAccount.creditLimit),
          status: user.fuelAccount.status
        } : null,
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

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user })
})

// Refresh token
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' })
    }

    // Verify token
    let decoded
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    } catch (error) {
      return res.status(403).json({ message: 'Invalid refresh token' })
    }

    // Check if token exists in database
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    })

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return res.status(403).json({ message: 'Invalid or expired refresh token' })
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(tokenRecord.userId)

    // Update refresh token
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    res.json({
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Logout
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      })
    }

    console.log(`✅ User logged out: ${req.user.email}`)

    res.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log('')
  console.log('🚀 ========================================')
  console.log(`🚀 Fuel Credit System API`)
  console.log(`🚀 Server running on port ${PORT}`)
  console.log('🚀 ========================================')
  console.log('')
  console.log('📋 Available endpoints:')
  console.log(`   GET  http://localhost:${PORT}/`)
  console.log(`   GET  http://localhost:${PORT}/health`)
  console.log(`   POST http://localhost:${PORT}/api/auth/register`)
  console.log(`   POST http://localhost:${PORT}/api/auth/login`)
  console.log(`   GET  http://localhost:${PORT}/api/auth/me`)
  console.log(`   POST http://localhost:${PORT}/api/auth/refresh`)
  console.log(`   POST http://localhost:${PORT}/api/auth/logout`)
  console.log('')
})