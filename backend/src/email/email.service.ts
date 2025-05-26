/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/**
 * Service xử lý logic gửi email
 */
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  /**
   * Thay thế các biến trong template email bằng thông tin của sinh viên
   * @param template - Chuỗi template chứa các biến như {ten}, {hoVaTen}, {mssv}, {email}
   * @param student - Đối tượng chứa thông tin sinh viên
   * @returns {string} - Chuỗi đã được thay thế các biến
   */
  private replaceVariables(
    template: string,
    student: { ten: string; mssv: string; email: string },
  ): string {
    // Tách tên cuối từ họ và tên
    const tenDayDu = student.ten.trim();
    const tenCuoi = tenDayDu.split(' ').pop() || tenDayDu; // Lấy từ cuối làm {ten}

    return template
      .replace(/{ten}/g, tenCuoi) // Chỉ lấy tên cuối
      .replace(/{hoVaTen}/g, tenDayDu) // Họ và tên đầy đủ
      .replace(/{mssv}/g, student.mssv)
      .replace(/{email}/g, student.email);
  }

  /**
   * Gửi email đến danh sách người nhận với nội dung tùy chỉnh
   * @param recipients - Danh sách người nhận email
   * @param subject - Tiêu đề email
   * @param bodyTemplate - Nội dung email (hỗ trợ biến như {ten}, {hoVaTen}, {mssv}, {email})
   * @param senderEmail - Email của người gửi (dùng làm chữ ký)
   * @returns {Promise<void>} - Không trả về giá trị
   * @throws {Error} - Nếu gửi email thất bại
   */
  async sendEmail(
    recipients: { email: string; ten: string; mssv: string }[],
    subject: string,
    bodyTemplate: string,
    senderEmail?: string,
  ): Promise<void> {
    const sender = this.configService.get<string>('MAIL_USER');

    for (const student of recipients) {
      const personalizedBody = this.replaceVariables(bodyTemplate, student);
      const personalizedSubject = this.replaceVariables(subject, student);

      // Thêm chữ ký email nếu có senderEmail
      let finalBody = personalizedBody;
      if (senderEmail) {
        finalBody += `<br><br><hr><p>Email người gửi: ${senderEmail}</p>`;
      }

      const mailOptions = {
        from: sender,
        to: student.email,
        subject: personalizedSubject,
        html: finalBody,
      };

      await this.transporter.sendMail(mailOptions);
    }
  }
}
