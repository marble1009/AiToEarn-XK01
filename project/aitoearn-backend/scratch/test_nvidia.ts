import OpenAI from 'openai';

async function testNvidia() {
  const apiKey = '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';
  const baseUrl = 'https://integrate.api.nvidia.com/v1';

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseUrl,
  });

  try {
    console.log('Testing NVIDIA NIM API...');
    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.1-8b-instruct",
      messages: [
        { role: "user", content: "Hello, who are you?" }
      ],
      max_tokens: 50,
    });

    console.log('Success!');
    console.log('Response:', completion.choices[0].message.content);
  } catch (error) {
    console.error('NVIDIA API Test Failed:', error);
  }
}

testNvidia();
