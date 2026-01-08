import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,  // BU SATIRI EKLE
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const PORT = process.env.PORT || 3001;
await app.listen(PORT, '0.0.0.0');
  console.log('🚀 Server running on http://localhost:3001');
}
bootstrap();
