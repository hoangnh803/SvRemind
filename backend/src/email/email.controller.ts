/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { TransactionsService } from '../transactions/transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Giả sử bạn có guard này

interface SendEmailDto {
  recipients: { email: string; ten: string; mssv: string }[];
  subject: string;
  body: string;
  emailTemplateId?: number;
}

@Controller('send-email')
@UseGuards(JwtAuthGuard) // Sử dụng JwtAuthGuard để xác thực
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Post()
  async sendEmail(@Request() req, @Body() sendEmailDto: SendEmailDto) {
    const createdBy = req.user.email || 'unknown'; // Lấy email từ req.user
    const { recipients, subject, body, emailTemplateId } = sendEmailDto;

    // Gửi email
    await this.emailService.sendEmail(recipients, subject, body);

    // Lưu transaction
    const transactionData = {
      sender: process.env.MAIL_USER || 'system@example.com',
      receivers: recipients.map((r) => r.email).join(','),
      emailTemplateId: emailTemplateId,
      body,
      plantDate: undefined,
      sendDate: new Date(),
      createdBy, // Sử dụng createdBy từ token
    };

    await this.transactionsService.create(transactionData);

    return { message: 'Email đã được gửi và giao dịch đã được lưu thành công' };
  }
}
