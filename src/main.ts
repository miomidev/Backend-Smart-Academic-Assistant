import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import express from 'express';
import path from 'path';
import { AppModule } from './app.module.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Serve static uploads
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // Global Pipes, Interceptors, Filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Smart Academic Assistant (SAA) API')
    .setDescription(
      'Dokumentasi API Backend Smart Academic Assistant untuk lomba IconFest UNSIL 2026. ' +
        'Mengimplementasikan standarisasi format response JSend, otentikasi Firebase, dan manajemen akademik.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Masukkan Firebase ID Token atau dev token (misal: dev-token)',
        in: 'header',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`=======================================================`);
  console.log(`🚀 SAA Backend Server berjalan di http://localhost:${port}`);
  console.log(`📚 Swagger API Docs tersedia di http://localhost:${port}/api/docs`);
  console.log(`=======================================================`);
}
await bootstrap();

