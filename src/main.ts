import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './commons/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './commons/filters/http-exception.filter';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { AuthService } from './modules/auth/auth.service';
import { ResponseInterceptor } from './commons/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log'],
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new ResponseInterceptor(),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  const port: number = +process.env.APP_PORT || 3000;
  app.use(cookieParser());
  const corsDev: string[] = process?.env?.CORS_DEV?.split(',') ?? ['null'];
  const corsStg: string[] = process?.env?.CORS_STG?.split(',') ?? ['null'];
  app.setGlobalPrefix(`api/backend`);
  const appModule = await NestFactory.createApplicationContext(AppModule);
  const authService = appModule.get(AuthService);
  await authService.init();
  app.enableCors({
    origin: [...corsDev, ...corsStg],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'CONNECT', 'OPTIONS'],
    credentials: true,
  });
  await app.listen(port, () => {
    console.log('listening to port : ' + port);
    console.log('url : http://localhost:' + port);
  });
}
bootstrap();
