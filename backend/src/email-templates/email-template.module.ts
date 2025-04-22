import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplateService } from './email-template.service';
import { EmailTemplateController } from './email-template.controller';
import { EmailTemplate } from './entities/email-template.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([EmailTemplate]), UsersModule],
  providers: [EmailTemplateService],
  controllers: [EmailTemplateController],
  exports: [TypeOrmModule],
})
export class EmailTemplateModule {}
