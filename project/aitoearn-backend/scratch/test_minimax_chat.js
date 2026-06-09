const apiKey = 'sk-cp-r3IWPmKXUM9NAJ6EFfi3kAd8W_I0Vlj9JS39kfgSoOmnDgBpxkf9HBrleRAzUcD5L8eAtNv6ZgQXe1iwBx83mDWkt7kXwC-j6vQNtSgts6Ep7AnklEq1lz8';
const url = 'https://api.minimaxi.com/v1/text/chat'; // Wait, let's try the compat endpoint too
const urlCompat = 'https://api.minimaxi.com/v1/chat/completions';

async function testChat() {
  const body = {
    model: 'abab6.5g-chat',
    messages: [
      { role: 'user', content: 'hello' }
    ]
  };

  console.log('Sending request to MiniMax Chat:', urlCompat);
  try {
    const response = await fetch(urlCompat, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    console.log('HTTP Status:', response.status, response.statusText);
    const resJson = await response.json();
    console.log('Response JSON:', JSON.stringify(resJson, null, 2));
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

testChat();
