const apiKey = 'sk-cp-vVYM7B9nZGff1HrfVBtXJ2b2UdUdbv5aQb5K_t8jPhX6_EdfQCpgTCF7--Uoq27s_ROEGm7bAZ0_8eMCHpI8OlmiX1vRG2lN7cU1T0kLC5CYi_hYEsWZSUc';
const url = 'https://api.minimaxi.com/v1/image_generation';

async function testImageGen() {
  const body = {
    model: 'image-01',
    prompt: 'A beautiful futuristic city with high skyscrapers and flying cars, digital art',
    n: 1,
    aspect_ratio: '1:1',
    response_format: 'url'
  };

  console.log('Sending request to MiniMax:', url);
  try {
    const response = await fetch(url, {
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

testImageGen();
