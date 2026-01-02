#!/bin/bash
# Authentication API Test Script
# Run this from the backend directory

echo ""
echo "🧪 Testing Fuel Credit Authentication API"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "📋 Test 1: Health Check"
curl -s http://localhost:3000/health
echo ""
echo ""

# Test 2: Register User
echo "📋 Test 2: Register User"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@fuelcredit.com",
    "password": "demo123456",
    "firstName": "Demo",
    "lastName": "User"
  }')
echo $REGISTER_RESPONSE
echo ""
echo ""

# Extract access token for next tests
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

# Test 3: Login User
echo "📋 Test 3: Login User"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@fuelcredit.com",
    "password": "demo123456"
  }')
echo $LOGIN_RESPONSE
echo ""
echo ""

# Extract access token from login
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

# Test 4: Get Current User (Protected Route)
echo "📋 Test 4: Get Current User (Protected Route)"
curl -s http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
echo ""
echo ""

echo "✅ All tests completed!"
echo ""