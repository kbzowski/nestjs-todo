import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // Konfiguracja CORS (wymagane dla credentials/cookies)
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });

  // Konfiguracja cookie-parser (wymagane dla JWT w cookies)
  app.use(cookieParser());

  // Konfiguracja class-validator do używania DI kontenera NestJS
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Konfiguracja walidacji
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Zabron pol niezdefiniowanych w DTO
      transform: true, // Automatycznie transformuj do DTO
    }),
  );

  await app.listen(process.env.PORT ?? 9000);
}

void bootstrap();
