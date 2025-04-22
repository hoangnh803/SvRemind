/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

/**
 * Controller xử lý các endpoint liên quan đến người dùng
 */
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Lấy danh sách tất cả người dùng
   * @returns Danh sách người dùng
   */
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách người dùng',
    type: [UserDto],
  })
  async findAll(): Promise<UserDto[]> {
    return this.usersService.findAll();
  }

  /**
   * Lấy thông tin chi tiết của một người dùng theo ID
   * @param id - ID của người dùng
   * @returns Thông tin người dùng
   */
  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo ID' })
  @ApiParam({ name: 'id', description: 'ID của người dùng', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin chi tiết người dùng',
    type: UserDto,
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy người dùng' })
  async findOne(@Param('id') id: string): Promise<UserDto> {
    try {
      return await this.usersService.findOne(parseInt(id));
    } catch (error) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }
  }
}
