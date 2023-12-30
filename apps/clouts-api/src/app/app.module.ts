import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileSystemStoredFile, NestjsFormDataModule } from 'nestjs-form-data';

import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    NestjsFormDataModule.config({
      isGlobal: true,
      storage: FileSystemStoredFile,
      autoDeleteFile: true,
    }),
    AuthModule,
    UsersModule,
    StorageModule,
    ImagesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
