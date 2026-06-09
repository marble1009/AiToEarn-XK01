import { describe, it, expect, beforeAll } from 'vitest';
import { OpenaiService } from './openai.service';
import { OpenaiConfig } from './openai.config';
import * as dotenv from 'dotenv';
import * as path from 'path';

describe('OpenaiService DashScope Integration', () => {
  let service: OpenaiService;

  beforeAll(() => {
    const envPath = path.resolve('c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-backend/.env.local');
    dotenv.config({ path: envPath });

    const configInstance = new OpenaiConfig();
    configInstance.apiKey = process.env.OPENAI_API_KEY!;
    configInstance.baseUrl = process.env.OPENAI_BASE_URL!;
    configInstance.timeout = 300 * 1000;

    service = new OpenaiService(configInstance);
  });

  it('should generate image with DashScope wan2.7-image', async () => {
    console.log('Running DashScope Image Generation unit test...');
    const res = await service.createImageGeneration({
      prompt: 'A sleek cyber-punk motorcycle driving through a futuristic city at night, neon lights',
      model: 'wan2.7-image',
      size: '1024x1024',
    });
    console.log('Image Result:', JSON.stringify(res, null, 2));
    expect(res.data).toBeDefined();
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data[0].url).toBeDefined();
  }, 40000);

  it('should generate video task with DashScope wanx2.1-t2v-plus', async () => {
    console.log('Running DashScope Video Synthesis unit test...');
    const res = await service.createVideo({
      prompt: 'A cute little kitten playing with a ball of yarn, warm cozy room',
      model: 'wanx2.1-t2v-plus',
      size: '1280x720',
    });
    console.log('Video Task Result:', JSON.stringify(res, null, 2));
    expect(res.id).toBeDefined();
    expect(res.status).toBe('in_progress');

    // Polling query
    const task = await service.retrieveVideo(res.id);
    console.log('Retrieved Video Task:', JSON.stringify(task, null, 2));
    expect(task.id).toBe(res.id);
    expect(task.status).toBeDefined();
  }, 40000);

  it('should generate video task with DashScope wan2.7-t2v', async () => {
    console.log('Running DashScope Wan 2.7 Video Synthesis unit test...');
    const res = await service.createVideo({
      prompt: 'A sleek drone flying fast through a futuristic metropolis skyscrapers, hyper-lapse cinematic',
      model: 'wan2.7-t2v',
      size: '1920x1080',
    });
    console.log('Wan 2.7 Video Task Result:', JSON.stringify(res, null, 2));
    expect(res.id).toBeDefined();
    expect(res.status).toBe('in_progress');

    // Polling query
    const task = await service.retrieveVideo(res.id);
    console.log('Retrieved Wan 2.7 Video Task:', JSON.stringify(task, null, 2));
    expect(task.id).toBe(res.id);
    expect(task.status).toBeDefined();
  }, 40000);
});
