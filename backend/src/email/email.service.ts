/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

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

  private replaceVariables(
    template: string,
    student: { ten: string; mssv: string; email: string },
  ): string {
    return template
      .replace(/{ten}/g, student.ten)
      .replace(/{mssv}/g, student.mssv)
      .replace(/{email}/g, student.email);
  }

  async sendEmail(
    recipients: { email: string; ten: string; mssv: string }[],
    subject: string,
    bodyTemplate: string,
  ): Promise<void> {
    const sender = this.configService.get<string>('MAIL_USER');

    for (const student of recipients) {
      const personalizedBody = this.replaceVariables(bodyTemplate, student);
      const personalizedSubject = this.replaceVariables(subject, student);

      const mailOptions = {
        from: sender,
        to: student.email,
        subject: personalizedSubject,
        html: personalizedBody,
      };

      await this.transporter.sendMail(mailOptions);
    }
  }
}
