import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

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
