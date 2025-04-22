/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/auth/dto/login.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email của người dùng dùng để đăng nhập',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail({}, { message: 'Vui lòng nhập email hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu của người dùng',
    example: 'password123',
    required: true,
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;
}
