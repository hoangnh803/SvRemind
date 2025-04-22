import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO cho dữ liệu người dùng
 */
export class UserDto {
  @ApiProperty({
    description: 'ID của người dùng',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Địa chỉ email của người dùng',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Mô tả về người dùng',
    example: 'Quản trị viên hệ thống',
  })
  description: string;

  @ApiProperty({
    description: 'Ngày tạo tài khoản người dùng',
    example: '2025-04-21T10:00:00.000Z',
  })
  createdDate: Date;

  @ApiProperty({
    description: 'Ngày cập nhật dữ liệu gần nhất',
    example: '2025-04-22T10:00:00.000Z',
    required: false,
  })
  latestData?: Date;

  @ApiProperty({
    description: 'Vai trò của người dùng',
    example: { id: 1, name: 'Admin' },
    required: false,
  })
  role?: { id: number; name: string };

  @ApiProperty({
    description: 'Danh sách thẻ sinh viên liên kết với người dùng',
    example: [{ id: 1, cardCode: '20210001' }],
    required: false,
  })
  studentCards?: { id: number; cardCode: string }[];

  @ApiProperty({
    description: 'Danh sách mẫu email được tạo bởi người dùng',
    example: [{ id: 1, name: 'Welcome Email', title: 'Chào mừng' }],
    required: false,
  })
  emailTemplates?: { id: number; name: string; title: string }[];

  @ApiProperty({
    description: 'Danh sách giao dịch email của người dùng',
    example: [
      { id: 1, sender: 'system@example.com', receivers: 'student@example.com' },
    ],
    required: false,
  })
  transactions?: { id: number; sender: string; receivers: string }[];
}
