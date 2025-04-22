/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

/**
 * Controller xử lý các yêu cầu proxy đến API bên thứ ba
 */
@ApiTags('proxy')
@Controller('proxy')
export class ProxyController {
  constructor(private readonly httpService: HttpService) {}

  /**
   * Lấy thông tin sinh viên dựa trên barcode
   * @param barcode - Mã barcode của sinh viên
   * @returns Thông tin sinh viên từ API bên thứ ba
   */
  @Get('student')
  @ApiOperation({ summary: 'Lấy thông tin sinh viên theo barcode' })
  @ApiQuery({
    name: 'barcode',
    type: String,
    description: 'Mã barcode của sinh viên',
    required: true,
    example: '20210001',
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin sinh viên được trả về thành công',
    schema: {
      example: {
        mssv: '20210001',
        ten: 'Nguyen Van A',
        email: 'student@example.com',
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Yêu cầu không hợp lệ (thiếu hoặc barcode không đúng định dạng)',
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy sinh viên với barcode đã cung cấp',
  })
  @ApiInternalServerErrorResponse({
    description: 'Lỗi server hoặc API bên thứ ba không phản hồi',
  })
  async getStudent(@Query('barcode') barcode: string) {
    const apiUrl = `https://api.toolhub.app/hust/TheSinhVien?barcode=${encodeURIComponent(barcode)}`;
    const response = await lastValueFrom(
      this.httpService.get(apiUrl, { headers: { accept: 'text/plain' } }),
    );
    return response.data;
  }
}
