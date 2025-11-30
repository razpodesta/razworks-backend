/**
 * @fileoverview Entry Point API Gateway
 * @description Bootstrap con Logger estructurado y binding a 0.0.0.0 para Cloud.
 */
import { Logger } from 'nestjs-pino';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // CORS: Habilitar para el Frontend (Vercel)
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*', // Ajustar en producción a https://midominio.com
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env['PORT'] || 3000;

  // IMPORTANTE: '0.0.0.0' es vital para Render/Docker
  await app.listen(port, '0.0.0.0');

  const logger = app.get(Logger);
  logger.log(`🚀 Application is running on: http://0.0.0.0:${port}/${globalPrefix}`);
}

bootstrap();
