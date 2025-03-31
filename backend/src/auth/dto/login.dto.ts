/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/auth/dto/login.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Vui lòng nhập email hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  username: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;
}
