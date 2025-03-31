// src/email-template/email-template.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplateService } from './email-template.service';
import { EmailTemplateController } from './email-template.controller';
import { EmailTemplate } from './entities/email-template.entity';
import { UsersModule } from '../users/users.module'; // Import UsersModule để sử dụng User entity

@Module({
  imports: [TypeOrmModule.forFeature([EmailTemplate]), UsersModule],
  providers: [EmailTemplateService],
  controllers: [EmailTemplateController],
})
export class EmailTemplateModule {}
