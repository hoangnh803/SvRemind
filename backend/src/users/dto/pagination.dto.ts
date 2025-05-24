import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { UserDto } from './user.dto';

export class UserPaginationQueryDto {
  @ApiProperty({
    description: 'Số trang (bắt đầu từ 1)',
    example: 1,
    default: 1,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Số lượng item trên một trang',
    example: 10,
    default: 10,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    description: 'Từ khóa tìm kiếm (tìm theo email, mô tả)',
    example: 'admin',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Dữ liệu trả về' })
  data: T[];

  @ApiProperty({ description: 'Metadata của dữ liệu được phân trang' })
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export class PaginatedUserResponseDto extends PaginatedResponseDto<UserDto> {
  // The data property is already inherited from PaginatedResponseDto<UserDto>
}
