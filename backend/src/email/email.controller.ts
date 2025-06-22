/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { TransactionsService } from '../transactions/transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SendEmailDto } from './dto/email.dto';

/**
 * Controller xử lý các endpoint liên quan đến gửi email
 */
@ApiTags('email')
@Controller('send-email')
@UseGuards(JwtAuthGuard)
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly transactionsService: TransactionsService,
  ) {}

  /**
   * Gửi email đến danh sách người nhận và lưu giao dịch
   * @param req - Request chứa thông tin người dùng từ JWT token
   * @param sendEmailDto - DTO chứa thông tin email cần gửi
   * @returns {Promise<{ message: string }>} - Trả về thông báo thành công
   * @throws {UnauthorizedException} - Nếu người dùng chưa xác thực
   */
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gửi email đến danh sách người nhận' })
  @ApiBody({ type: SendEmailDto })
  @ApiResponse({
    status: 200,
    description: 'Email đã được gửi và giao dịch đã được lưu thành công',
    schema: {
      example: {
        message: 'Email đã được gửi và giao dịch đã được lưu thành công',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  async sendEmail(@Request() req, @Body() sendEmailDto: SendEmailDto) {
    const userEmail = req.user.email || 'unknown';
    const senderEmail = req.user.email; // Lấy email từ JWT token để làm chữ ký
    const { recipients, subject, body, emailTemplateId } = sendEmailDto;

    // Gửi email với chữ ký
    await this.emailService.sendEmail(recipients, subject, body, senderEmail);

    // Lưu transaction
    const transactionData = {
      sender: process.env.MAIL_USER || 'system@example.com',
      receivers: recipients.map((r) => r.email).join(','),
      emailTemplateId: emailTemplateId,
      body,
      plantDate: undefined,
      sendDate: new Date(),
      title: subject, // Adding the missing 'title' property
    };

    await this.transactionsService.create(transactionData, userEmail);

    return { message: 'Email đã được gửi và giao dịch đã được lưu thành công' };
  }
}
