import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ViolationModule } from './modules/violation/violation.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from './commons/configs/database.config';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ViolationTypeModule } from './modules/violation-type/violation-type.module';
import { StudentModule } from './modules/student/student.module';
import { ClassesModule } from './modules/classes/classes.module';
import { UserModule } from './modules/user/user.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ImageModule } from './modules/image/image.module';
import { SchoolProfileModule } from './modules/school-profile/school-profile.module';
import { LoggerMiddleware } from './commons/interceptors/logger.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    ViolationModule,
    AuthModule,
    ImageModule,
    ViolationModule,
    ViolationTypeModule,
    StudentModule,
    ClassesModule,
    UserModule,
    DashboardModule,
    SchoolProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Apply to all routes
  }
}
