/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('email-templates')
@Controller('email-templates')
@UseGuards(JwtAuthGuard)
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo mới một mẫu email' })
  @ApiBody({ type: CreateEmailTemplateDto })
  @ApiResponse({
    status: 201,
    description: 'Mẫu email đã được tạo thành công',
    type: EmailTemplate,
  })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  create(
    @Request() req,
    @Body() templateData: CreateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    const userId = req.user.id;
    return this.emailTemplateService.create(userId, templateData);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách mẫu email của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách mẫu email',
    type: [EmailTemplate],
  })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  findByUser(@Request() req): Promise<EmailTemplate[]> {
    const userId = req.user.id;
    return this.emailTemplateService.findByUser(userId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy chi tiết một mẫu email theo ID' })
  @ApiParam({ name: 'id', description: 'ID của mẫu email', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết mẫu email',
    type: EmailTemplate,
  })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mẫu email' })
  findOne(@Param('id') id: string, @Request() req): Promise<EmailTemplate> {
    const userId = req.user.id;
    return this.emailTemplateService.findOne(+id, userId);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật một mẫu email' })
  @ApiParam({ name: 'id', description: 'ID của mẫu email', example: '1' })
  @ApiBody({ type: CreateEmailTemplateDto })
  @ApiResponse({
    status: 200,
    description: 'Mẫu email đã được cập nhật thành công',
    type: EmailTemplate,
  })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mẫu email' })
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() templateData: Partial<CreateEmailTemplateDto>,
  ): Promise<EmailTemplate> {
    const userId = req.user.id;
    return this.emailTemplateService.update(+id, userId, templateData);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa một mẫu email' })
  @ApiParam({ name: 'id', description: 'ID của mẫu email', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Mẫu email đã được xóa thành công',
  })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mẫu email' })
  remove(@Param('id') id: string, @Request() req): Promise<void> {
    const userId = req.user.id;
    return this.emailTemplateService.remove(+id, userId);
  }
}
