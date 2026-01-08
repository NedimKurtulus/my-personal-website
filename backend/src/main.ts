import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://my-project-9ga6ox8sc-nks-projects-b2b2385a.vercel.app',
    ],
    credentials: true,
  });

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT, '0.0.0.0');

  console.log(`🚀 Server running on port ${PORT}`);
}

bootstrap();
