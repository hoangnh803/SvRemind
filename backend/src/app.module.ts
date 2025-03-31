/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProxyController } from './proxy/proxy.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { StudentCard } from './student-cards/entities/student-card.entity';
import { EmailTemplate } from './email-templates/entities/email-template.entity';
import { Transaction } from './transactions/entities/transaction.entity';
import { UsersModule } from './users/users.module';
import { HttpModule } from '@nestjs/axios';
import { EmailTemplateModule } from './email-templates/email-template.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Role, StudentCard, EmailTemplate, Transaction],
      synchronize: true, // Chỉ dùng trong development, tự tạo bảng
    }),
    EmailTemplateModule,
    AuthModule,
    UsersModule,
    HttpModule,
  ],
  controllers: [AppController, ProxyController],
  providers: [AppService],
})
export class AppModule {}
