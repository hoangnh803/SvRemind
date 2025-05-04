import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateStudentCardDto {
  @ApiProperty({
    description: 'Full name of the student',
    example: 'Nguyen Van A',
  })
  @IsString()
  @IsNotEmpty()
  fullNameNS: string;

  @ApiProperty({
    description:
      'Student code (MSSV), unique per creator email (derived from JWT token)',
    example: '20210001',
  })
  @IsString()
  @IsNotEmpty()
  studentCode: string;

  @ApiProperty({
    description: 'Email address of the student',
    example: 'student@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Card code (e.g., barcode or QR code data)',
    example: 'BARCODE123',
  })
  @IsString()
  @IsNotEmpty()
  cardCode: string;
}

export class CheckStudentCardResponseDto {
  @ApiProperty({
    description:
      'Indicates if a student card with the given studentCode and creator email exists',
    example: true,
  })
  exists: boolean;
}
