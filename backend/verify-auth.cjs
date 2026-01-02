// Quick verification script for auth endpoints
const BASE_URL = 'http://localhost:3000';

async function testAuth() {
  console.log('\n🔐 Testing Authentication System\n');
  console.log('='.repeat(50));

  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'password123';
  let accessToken = '';
  let refreshToken = '';

  // 1. Test Registration
  console.log('\n1️⃣  Testing REGISTER...');
  try {
    const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'User'
      })
    });
    const registerData = await registerRes.json();
    
    if (registerRes.status === 201) {
      console.log('   ✅ Registration SUCCESS');
      console.log(`   User: ${registerData.user.email}`);
      console.log(`   Fuel Account Balance: ${registerData.user.fuelAccount.balance}`);
      accessToken = registerData.tokens.accessToken;
      refreshToken = registerData.tokens.refreshToken;
    } else {
      console.log('Registration FAILED:', registerData.message);
      return;
    }
  } catch (err) {
    console.log('Registration ERROR:', err.message);
    return;
  }

  // 2. Test Login
  console.log('\n Testing LOGIN...');
  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    const loginData = await loginRes.json();
    
    if (loginRes.status === 200) {
      console.log('Login SUCCESS');
      console.log(`User: ${loginData.user.email}`);
      accessToken = loginData.tokens.accessToken;
      refreshToken = loginData.tokens.refreshToken;
    } else {
      console.log('Login FAILED:', loginData.message);
    }
  } catch (err) {
    console.log('Login ERROR:', err.message);
  }

  // 3. Test Get Me (Protected Route)
  console.log('\n3️⃣  Testing GET ME (protected)...');
  try {
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const meData = await meRes.json();
    
    if (meRes.status === 200) {
      console.log('Get Me SUCCESS');
      console.log(`User: ${meData.user.firstName} ${meData.user.lastName}`);
      console.log(`Email: ${meData.user.email}`);
    } else {
      console.log('Get Me FAILED:', meData.message);
    }
  } catch (err) {
    console.log('Get Me ERROR:', err.message);
  }

  // 4. Test Refresh Token
  console.log('\n Testing REFRESH TOKEN...');
  try {
    const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    const refreshData = await refreshRes.json();
    
    if (refreshRes.status === 200) {
      console.log('Token Refresh SUCCESS');
      console.log('New tokens generated');
      accessToken = refreshData.tokens.accessToken;
      refreshToken = refreshData.tokens.refreshToken;
    } else {
      console.log('Token Refresh FAILED:', refreshData.message);
    }
  } catch (err) {
    console.log('Token Refresh ERROR:', err.message);
  }

  // 5. Test Logout
  console.log('\n Testing LOGOUT...');
  try {
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ refreshToken })
    });
    const logoutData = await logoutRes.json();
    
    if (logoutRes.status === 200) {
      console.log('Logout SUCCESS');
    } else {
      console.log('Logout FAILED:', logoutData.message);
    }
  } catch (err) {
    console.log('Logout ERROR:', err.message);
  }

  // 6. Test Protected Route After Logout (should still work since token isn't invalidated)
  console.log('\n Testing GET ME after logout...');
  try {
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const meData = await meRes.json();
    
    if (meRes.status === 200) {
      console.log('Still works (access token valid until expiry)');
    } else {
      console.log('Access denied:', meData.message);
    }
  } catch (err) {
    console.log('ERROR:', err.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('Authentication System Verification Complete!');
  console.log('='.repeat(50) + '\n');
}

testAuth().catch(console.error);
