const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../apps/aitoearn-ai/src/app.module');
const { ModelsConfigService } = require('../apps/aitoearn-ai/src/core/ai/models-config/models-config.service');

async function printModels() {
  console.log('Bootstrapping NestJS app to read models config...');
  // Set env vars to avoid validation errors
  process.env.MONGODB_HOST = 'localhost';
  process.env.MONGODB_PORT = '27018';
  process.env.MONGODB_USERNAME = 'admin';
  process.env.MONGODB_PASSWORD = 'password';
  process.env.REDIS_HOST = 'localhost';
  process.env.REDIS_PORT = '6380';
  process.env.REDIS_PASSWORD = 'password';
  process.env.JWT_SECRET = 'test';
  process.env.INTERNAL_TOKEN = 'test';

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const configService = app.get(ModelsConfigService);
  
  console.log('Image Generation Models:');
  console.log(JSON.stringify(configService.config.image.generation, null, 2));
  
  await app.close();
}

printModels().catch(console.error);
