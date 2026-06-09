const apiKey = 'sk-cp-r3IWPmKXUM9NAJ6EFfi3kAd8W_I0Vlj9JS39kfgSoOmnDgBpxkf9HBrleRAzUcD5L8eAtNv6ZgQXe1iwBx83mDWkt7kXwC-j6vQNtSgts6Ep7AnklEq1lz8';

async function testAnthropicLarge() {
  console.log('\nTesting Anthropic-compatible endpoint with large max_tokens...');
  try {
    const response = await fetch('https://api.minimaxi.com/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.7',
        messages: [{ role: 'user', content: 'Hello, reply in one sentence.' }],
        max_tokens: 1000
      })
    });
    console.log('Anthropic response status:', response.status);
    const data = await response.json();
    console.log('Anthropic response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Anthropic test failed:', error);
  }
}

async function run() {
  await testAnthropicLarge();
}

run();
