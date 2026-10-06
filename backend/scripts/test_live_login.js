const http = require('http');

const testAccounts = [
  { email: 'student@test.com', pass: 'Student@123' },
  { email: 'student01@test.com', pass: 'Student@123' },
  { email: 'student02@test.com', pass: 'Student@123' },
  { email: 'student03@test.com', pass: 'Student@123' },
  { email: 'student04@test.com', pass: 'Student@123' },
  { email: 'student05@test.com', pass: 'Student@123' },
  { email: 'faculty@test.com', pass: 'Faculty@123' },
  { email: 'faculty01@test.com', pass: 'Faculty@123' },
  { email: 'faculty02@test.com', pass: 'Faculty@123' },
  { email: 'faculty03@test.com', pass: 'Faculty@123' },
  { email: 'faculty04@test.com', pass: 'Faculty@123' },
  { email: 'faculty05@test.com', pass: 'Faculty@123' },
  { email: 'admin@test.com', pass: 'Admin@123' }
];

function login(email, password) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ email, password });
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ status: 500, error: err.message });
    });

    req.write(payload);
    req.end();
  });
}

async function testAll() {
  console.log("=== TESTING LIVE LOGIN ENDPOINT ===");
  for (const acc of testAccounts) {
    const res = await login(acc.email, acc.pass);
    if (res.status === 200 && res.data?.success) {
      console.log(`✅ [200 OK] ${acc.email} -> Role: ${res.data.data.user.role_name}, Name: ${res.data.data.user.name}`);
    } else {
      console.log(`❌ [${res.status} FAIL] ${acc.email} -> ${JSON.stringify(res.data || res.error || res.raw)}`);
    }
  }
}

testAll();
