const nodemailer = require('nodemailer');

const email = 'aitoearn@aurastring.cloud';
const host = 'smtp.exmail.qq.com';
const port = 465;

const passwords = [
  '109911lZ', // lowercase L, uppercase Z
  '1099111Z', // number 1, uppercase Z
  '109911IZ', // uppercase I, uppercase Z
  '109911lz', // lowercase L, lowercase Z
  '1099111z', // number 1, lowercase Z
  '109911Iz', // uppercase I, lowercase Z
  '109911Lz', // uppercase L, lowercase Z
  '109911LZ'  // uppercase L, uppercase Z
];

async function testPassword(pass) {
  console.log(`Testing password: "${pass}"...`);
  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: true, // true for port 465
    auth: {
      user: email,
      pass: pass
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000
  });

  try {
    await transporter.verify();
    console.log(`✅ SUCCESS! Password "${pass}" works!`);
    return true;
  } catch (error) {
    console.log(`❌ FAILED for "${pass}": ${error.message}`);
    return false;
  }
}

async function run() {
  for (const pass of passwords) {
    const success = await testPassword(pass);
    if (success) {
      console.log(`🎉 Found working password: ${pass}`);
      break;
    }
  }
  console.log('All tests completed.');
}

run();
