import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO cho việc gửi email
 */
export class SendEmailDto {
  @ApiProperty({
    description: 'Danh sách người nhận email',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Địa chỉ email của người nhận',
          example: 'student@example.com',
        },
        ten: {
          type: 'string',
          description: 'Tên của người nhận',
          example: 'Nguyen Van A',
        },
        mssv: {
          type: 'string',
          description: 'Mã số sinh viên của người nhận',
          example: '20210001',
        },
      },
    },
    required: true,
  })
  recipients: { email: string; ten: string; mssv: string }[];

  @ApiProperty({
    description: 'Tiêu đề email',
    example: 'Thông báo lịch học',
    required: true,
  })
  subject: string;

  @ApiProperty({
    description: 'Nội dung email (hỗ trợ biến như {ten}, {mssv}, {email})',
    example: 'Chào {ten}, MSSV của bạn là {mssv}.',
    required: true,
  })
  body: string;

  @ApiProperty({
    description: 'ID của mẫu email (tùy chọn)',
    example: 1,
    required: false,
  })
  emailTemplateId?: number;
}
