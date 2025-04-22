import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO cho việc tạo hoặc cập nhật email template
 */
export class CreateEmailTemplateDto {
  @ApiProperty({
    description: 'Tên của mẫu email',
    example: 'Welcome Email',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'Tiêu đề của mẫu email',
    example: 'Chào mừng bạn đến với hệ thống',
    required: true,
  })
  title: string;

  @ApiProperty({
    description: 'Nội dung của mẫu email (hỗ trợ biến như {ten}, {mssv})',
    example: 'Chào {ten}, chào mừng bạn đến với hệ thống!',
    required: true,
  })
  body: string;
}
