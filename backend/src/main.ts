// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { WsAdapter } from '@nestjs/platform-ws';

dotenv.config(); // Load biến môi trường từ .env

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(3001);
}
bootstrap();
