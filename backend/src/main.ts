// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { WsAdapter } from '@nestjs/platform-ws';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config(); // Load biến môi trường từ .env

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  app.useWebSocketAdapter(new WsAdapter(app));
  const config = new DocumentBuilder()
    .setTitle('SVremind API')
    .setDescription('The API description')
    .setVersion('1.0')
    .setContact(
      'Nguyen Huy Hoang',
      'https://github.com/hoangnh803',
      'hoang.nh215581@sis.hust.edu.vn',
    )
    .addBearerAuth() // Nếu sử dụng JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3001);
}
bootstrap();
