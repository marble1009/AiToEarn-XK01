const nodemailer = require('nodemailer');

const email = 'aitoearn@aurastring.cloud';
const host = 'smtp.exmail.qq.com';
const port = 465;
const pass = 'drbhnAEFesefxsh9';

async function run() {
  console.log(`Testing new SMTP credentials for ${email}...`);
  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: true, // true for port 465
    auth: {
      user: email,
      pass: pass
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000
  });

  try {
    await transporter.verify();
    console.log(`✅ SUCCESS! SMTP Authentication verified!`);
    
    // Attempt sending a test email to the same address
    console.log(`Sending test email...`);
    const info = await transporter.sendMail({
      from: `"AiToEarn Test" <${email}>`,
      to: email,
      subject: 'AiToEarn SMTP Verification Success!',
      text: 'Congratulations! The SMTP authorization code works perfectly.',
      html: '<b>Congratulations!</b> The SMTP authorization code works perfectly.'
    });
    console.log(`✅ Mail sent successfully! Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ SMTP Test Failed:`, error);
  }
}

run();
