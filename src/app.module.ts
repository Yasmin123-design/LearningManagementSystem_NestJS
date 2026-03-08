import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import appConfig from './config/app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { MailModule } from './modules/mail/mail.module';
import { ModulesModule } from './modules/modules/modules.module';
import { LessonsModule } from './modules/lessons/lessons.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('app.database.host'),
        port: configService.get<number>('app.database.port'),
        username: configService.get<string>('app.database.username'),
        password: configService.get<string>('app.database.password'),
        database: configService.get<string>('app.database.database'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('app.nodeEnv') === 'development',
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('THROTTLE_TTL') || 60,
          limit: configService.get<number>('THROTTLE_LIMIT') || 10,
        },
      ],
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 5,
      max: 100,
    }),
    AuthModule,
    UsersModule,
    CoursesModule,
    CategoriesModule,
    EnrollmentsModule,
    ReviewsModule,
    PaymentsModule,
    MailModule,
    ModulesModule,
    LessonsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
