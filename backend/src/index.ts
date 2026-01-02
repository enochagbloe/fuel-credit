/* eslint-disable import/no-named-as-default */
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'

// Import routes
import authRoutes from './routes/auth.js'

// Load environment variables from .env file
dotenv.config()

// Create Express application
const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet()) // Adds security headers
app.use(cors({
  origin: ['http://localhost:3000', 'exp://localhost:19000'], // Allow React Native dev server
  credentials: true,
}))

// General rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Body parsing middlewares
app.use(express.json()) // Parse JSON requests
app.use(express.urlencoded({ extended: true })) // Parse form data

// API Routes
app.use('/api/auth', authRoutes)

// Basic test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Fuel Credit System API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Health check endpoint (useful for monitoring)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
  console.log(`API base: http://localhost:${PORT}`)
})