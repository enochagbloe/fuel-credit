/* eslint-disable no-undef */
const http = require('http')

// Test 1: Health Check
console.log('\n📋 Test 1: Health Check')
http.get('http://localhost:3000/health', (res) => {
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => {
    console.log('Status:', res.statusCode)
    console.log('Response:', data)
    
    // Test 2: Register
    testRegister()
  })
}).on('error', (err) => {
  console.log('❌ Server not running:', err.message)
})

function testRegister() {
  console.log('\n📋 Test 2: Register User')
  
  const postData = JSON.stringify({
    email: 'testuser@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User'
  })

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }

  const req = http.request(options, (res) => {
    let data = ''
    res.on('data', chunk => data += chunk)
    res.on('end', () => {
      console.log('Status:', res.statusCode)
      try {
        const json = JSON.parse(data)
        console.log('Response:', JSON.stringify(json, null, 2))
        
        if (json.tokens) {
          // Test 3: Login
          testLogin()
        }
      } catch (e) {
        console.log('Response:', data)
      }
    })
  })

  req.on('error', (err) => console.log('❌ Error:', err.message))
  req.write(postData)
  req.end()
}

function testLogin() {
  console.log('\n📋 Test 3: Login User')
  
  const postData = JSON.stringify({
    email: 'testuser@example.com',
    password: 'password123'
  })

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }

  const req = http.request(options, (res) => {
    let data = ''
    res.on('data', chunk => data += chunk)
    res.on('end', () => {
      console.log('Status:', res.statusCode)
      try {
        const json = JSON.parse(data)
        console.log('Response:', JSON.stringify(json, null, 2))
        
        if (json.tokens) {
          testMe(json.tokens.accessToken)
        }
      } catch (e) {
        console.log('Response:', data)
      }
    })
  })

  req.on('error', (err) => console.log('❌ Error:', err.message))
  req.write(postData)
  req.end()
}

function testMe(token) {
  console.log('\n📋 Test 4: Get Current User (with token)')
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/me',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }

  const req = http.request(options, (res) => {
    let data = ''
    res.on('data', chunk => data += chunk)
    res.on('end', () => {
      console.log('Status:', res.statusCode)
      try {
        const json = JSON.parse(data)
        console.log('Response:', JSON.stringify(json, null, 2))
        console.log('\n✅ All tests completed!')
      } catch (e) {
        console.log('Response:', data)
      }
    })
  })

  req.on('error', (err) => console.log('❌ Error:', err.message))
  req.end()
}