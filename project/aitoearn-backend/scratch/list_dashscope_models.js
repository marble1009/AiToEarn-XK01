const apiKey = 'sk-6701b98283b145a19cc64c2712b83f67';

async function listModels() {
  console.log('Fetching models from DashScope...');
  try {
    // DashScope doesn't support sub_type query param on standard list models, let's fetch all models
    // Wait, let's fetch task status or model list
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    console.log('Status:', response.status);
    const data = await response.json();
    const modelIds = data.data.map(m => m.id);
    console.log('All Models:', modelIds.filter(id => id.includes('wan') || id.includes('flux') || id.includes('sd') || id.includes('stable-diffusion') || id.includes('qwen')));
  } catch (e) {
    console.error('Error:', e);
  }
}

listModels();
