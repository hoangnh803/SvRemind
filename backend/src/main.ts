/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
// import { WsAdapter } from '@nestjs/platform-ws'; // Comment out or remove WsAdapter
import { IoAdapter } from '@nestjs/platform-socket.io'; // Import IoAdapter
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config(); // Load biến môi trường từ .env

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // Configure main HTTP CORS
  app.enableCors({
    origin: 'https://sv-remind.vercel.app', // Your frontend origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useWebSocketAdapter(new IoAdapter(app.getHttpServer())); // Pass app.getHttpServer()
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
  SwaggerModule.setup('docs', app, document);
  await app.listen(
    process.env.PORT ?? 3000,
    process.env.INTERFACE_NETWORK ?? 'localhost',
  );
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`WebSocket server should be available via the same port.`);
}
bootstrap();
