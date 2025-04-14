/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/email-template/email-template.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { EmailTemplateService } from './email-template.service';
import { EmailTemplate } from './entities/email-template.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Giả sử bạn có guard để xác thực JWT

@Controller('email-templates')
@UseGuards(JwtAuthGuard) // Yêu cầu xác thực để truy cập API
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  @Post()
  create(
    @Request() req,
    @Body() templateData: Partial<EmailTemplate>,
  ): Promise<EmailTemplate> {
    const userId = req.user.id; // Lấy userId từ token JWT
    return this.emailTemplateService.create(userId, templateData);
  }

  @Get()
  findByUser(@Request() req): Promise<EmailTemplate[]> {
    const userId = req.user.id;
    console.log('Creating template with userId:', req.user);
    return this.emailTemplateService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req): Promise<EmailTemplate> {
    const userId = req.user.id;
    return this.emailTemplateService.findOne(+id, userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() templateData: Partial<EmailTemplate>,
  ): Promise<EmailTemplate> {
    const userId = req.user.id;
    return this.emailTemplateService.update(+id, userId, templateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req): Promise<void> {
    const userId = req.user.id;
    return this.emailTemplateService.remove(+id, userId);
  }
}
