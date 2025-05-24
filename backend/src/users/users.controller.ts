/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiNotFoundResponse,
  ApiQuery,
} from '@nestjs/swagger';
import {
  PaginatedUserResponseDto,
  UserPaginationQueryDto,
} from './dto/pagination.dto';

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
   * Lấy danh sách người dùng có phân trang và tìm kiếm
   * @returns Danh sách người dùng có phân trang
   */
  @Get('paginated')
  @ApiOperation({
    summary: 'Lấy danh sách người dùng có phân trang và tìm kiếm',
  })
  @ApiQuery({ type: UserPaginationQueryDto })
  @ApiResponse({
    status: 200,
    description: 'Danh sách người dùng có phân trang',
    type: PaginatedUserResponseDto,
  })
  async findAllPaginated(
    @Query() paginationQuery: UserPaginationQueryDto,
  ): Promise<PaginatedUserResponseDto> {
    return await this.usersService.findAllPaginated(
      paginationQuery.page,
      paginationQuery.limit,
      paginationQuery.search,
    );
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
