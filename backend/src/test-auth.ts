import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

async function testAuth() {
  try {
    console.log('Testing Authentication System...')
    
    // Test JWT secrets
    const jwtSecret = process.env.JWT_SECRET
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET
    
    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT secrets not found in environment')
    }
    
    console.log('JWT secrets loaded')
    
    // Test password hashing
    const password = 'testpassword123'
    const hashedPassword = await bcrypt.hash(password, 12)
    const isValid = await bcrypt.compare(password, hashedPassword)
    
    if (!isValid) {
      throw new Error('Password hashing failed')
    }
    
    console.log('Password hashing works')
    
    // Test JWT signing
    const testUserId = 'test-user-id'
    const accessToken = jwt.sign({ userId: testUserId }, jwtSecret, { expiresIn: '24h' })
    const refreshToken = jwt.sign({ userId: testUserId }, jwtRefreshSecret, { expiresIn: '7d' })
    
    console.log('JWT token generation works')
    
    // Test JWT verification
    const decodedAccess = jwt.verify(accessToken, jwtSecret) as any
    const decodedRefresh = jwt.verify(refreshToken, jwtRefreshSecret) as any
    
    if (decodedAccess.userId !== testUserId || decodedRefresh.userId !== testUserId) {
      throw new Error('JWT verification failed')
    }
    
    console.log('JWT token verification works')
    
    // Test database connection
    await prisma.$connect()
    console.log('Database connection works')
    
    const userCount = await prisma.user.count()
    console.log(`Current users in database: ${userCount}`)
    
    console.log('All authentication components are working!')
    
  } catch (error) {
    console.error('Authentication test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAuth()