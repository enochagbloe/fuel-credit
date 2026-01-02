import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully!')
    
    // Check if we can query (should return empty array since no users yet)
    const userCount = await prisma.user.count()
    console.log(`Current user count: ${userCount}`)
    
  } catch (error) {
    console.error('Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()