const apiKey = 'sk-6701b98283b145a19cc64c2712b83f67';

async function listModels() {
  const url = 'https://api.siliconflow.cn/v1/models?sub_type=text2video';
  console.log('Fetching text2video models from SiliconFlow...');
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Text2Video Models:', data.data.map(m => m.id));
  } catch (e) {
    console.error('Error fetching text2video:', e);
  }

  const urlI2V = 'https://api.siliconflow.cn/v1/models?sub_type=image2video';
  console.log('Fetching image2video models from SiliconFlow...');
  try {
    const response = await fetch(urlI2V, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    const data = await response.json();
    console.log('Image2Video Models:', data.data.map(m => m.id));
  } catch (e) {
    console.error('Error fetching image2video:', e);
  }

  const urlImg = 'https://api.siliconflow.cn/v1/models?sub_type=text2image';
  console.log('Fetching text2image models from SiliconFlow...');
  try {
    const response = await fetch(urlImg, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    const data = await response.json();
    console.log('Text2Image Models:', data.data.map(m => m.id));
  } catch (e) {
    console.error('Error fetching text2image:', e);
  }
}

listModels();
