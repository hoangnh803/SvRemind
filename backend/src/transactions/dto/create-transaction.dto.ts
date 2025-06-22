import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO cho việc tạo giao dịch email
 */
export class CreateTransactionDto {
  @ApiProperty({
    description: 'Địa chỉ email của người gửi',
    example: 'system@example.com',
    required: true,
  })
  sender: string;

  @ApiProperty({
    description: 'Danh sách địa chỉ email người nhận, cách nhau bởi dấu phẩy',
    example: 'student1@example.com,student2@example.com',
    required: true,
  })
  receivers: string;

  @ApiProperty({
    description: 'ID của mẫu email (tùy chọn)',
    example: 1,
    required: false,
  })
  emailTemplateId?: number;

  @ApiProperty({
    description: 'Tiêu đề email',
    example: 'Thông báo lịch học',
    required: true,
  })
  title: string;

  @ApiProperty({
    description: 'Nội dung email',
    example: 'Chào {ten}, MSSV của bạn là {mssv}.',
    required: true,
  })
  body: string;

  @ApiProperty({
    description: 'Ngày lập kế hoạch gửi email (tùy chọn)',
    example: '2025-04-22T10:00:00.000Z',
    required: false,
  })
  plantDate?: Date;

  @ApiProperty({
    description: 'Ngày gửi email',
    example: '2025-04-21T10:00:00.000Z',
    required: true,
  })
  sendDate: Date;
}
