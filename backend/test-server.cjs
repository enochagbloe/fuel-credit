const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000
const prisma = new PrismaClient()

// Middleware
app.use(helmet())
app.use(cors({ origin: ['http://localhost:3000', 'exp://localhost:19000'], credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Test endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Fuel Credit API - JavaScript Test Version',
    endpoints: [
      'POST /register - Register user',
      'POST /login - Login user',
      'GET /health - Health check'
    ]
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Register endpoint
app.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user and fuel account
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email: email.toLowerCase(), passwordHash, firstName, lastName },
      })

      const fuelAccount = await tx.fuelAccount.create({
        data: { userId: user.id, balance: 0.00, creditLimit: 1000.00 },
      })

      return { user, fuelAccount }
    })

    // Generate tokens
    const accessToken = jwt.sign({ userId: result.user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
    const refreshToken = jwt.sign({ userId: result.user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })

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

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { fuelAccount: true },
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
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })

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

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`)
  console.log(`📋 Test endpoints: http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})