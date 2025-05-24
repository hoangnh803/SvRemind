/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Headers,
  UnauthorizedException,
  NotFoundException,
  Delete,
  Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiHeader,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Transaction } from './entities/transaction.entity';
import {
  PaginatedTransactionResponseDto,
  TransactionPaginationQueryDto,
} from './dto/pagination.dto';

/**
 * Controller xử lý các endpoint liên quan đến giao dịch email
 */
@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Tạo một giao dịch email mới
   * @param createTransactionDto - DTO chứa thông tin giao dịch
   * @param authHeader - Token xác thực trong header
   * @returns Giao dịch đã được tạo
   */
  @Post()
  @ApiOperation({ summary: 'Tạo giao dịch email mới' })
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer token để xác thực',
    required: true,
  })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({
    status: 201,
    description: 'Giao dịch đã được lưu thành công',
    schema: {
      example: {
        message: 'Transaction đã được lưu thành công',
        transaction: {
          id: 1,
          sender: 'system@example.com',
          receivers: 'student1@example.com,student2@example.com',
          title: 'Thông báo lịch học',
          body: 'Chào {ten}, MSSV của bạn là {mssv}.',
          plantDate: null,
          sendDate: '2025-04-21T10:00:00.000Z',
          createdBy: 'admin@example.com',
          user: { id: 1, email: 'admin@example.com' },
          emailTemplate: { id: 1, name: 'Welcome Email', title: 'Chào mừng' },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token không hợp lệ' })
  @ApiBadRequestResponse({ description: 'Dữ liệu đầu vào không hợp lệ' })
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Headers('authorization') authHeader: string,
  ) {
    if (!authHeader) {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    const transaction =
      await this.transactionsService.create(createTransactionDto);
    return { message: 'Transaction đã được lưu thành công', transaction };
  }

  /**
   * Lấy danh sách tất cả giao dịch
   * @returns Danh sách giao dịch
   */
  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách tất cả giao dịch (không phân trang)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách giao dịch',
    type: [Transaction],
  })
  findAll() {
    return this.transactionsService.findAll();
  }

  /**
   * Lấy danh sách giao dịch có phân trang và tìm kiếm
   * @returns Danh sách giao dịch có phân trang
   */
  @Get('paginated')
  @ApiOperation({
    summary: 'Lấy danh sách giao dịch có phân trang và tìm kiếm',
  })
  @ApiQuery({ type: TransactionPaginationQueryDto })
  @ApiResponse({
    status: 200,
    description: 'Danh sách giao dịch có phân trang',
    type: PaginatedTransactionResponseDto,
  })
  async findAllPaginated(
    @Query() paginationQuery: TransactionPaginationQueryDto,
  ): Promise<PaginatedTransactionResponseDto> {
    return await this.transactionsService.findAllPaginated(
      paginationQuery.page,
      paginationQuery.limit,
      paginationQuery.search,
    );
  }

  /**
   * Lấy chi tiết một giao dịch theo ID
   * @param id - ID của giao dịch
   * @returns Chi tiết giao dịch
   */
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết giao dịch theo ID' })
  @ApiParam({ name: 'id', description: 'ID của giao dịch', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết giao dịch',
    type: Transaction,
  })
  @ApiNotFoundResponse({ description: 'Transaction không tồn tại' })
  async findOne(@Param('id') id: string) {
    const transaction = await this.transactionsService.findOne(+id);
    if (transaction === undefined || transaction === null) {
      throw new NotFoundException('Transaction không tồn tại');
    }
    return transaction;
  }

  /**
   * Xóa một giao dịch theo ID
   * @param id - ID của giao dịch
   * @param authHeader - Token xác thực trong header
   * @returns Thông báo xóa thành công
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa giao dịch theo ID' })
  @ApiParam({ name: 'id', description: 'ID của giao dịch', example: '1' })
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer token để xác thực',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Giao dịch đã được xóa thành công',
    schema: {
      example: { message: 'Transaction đã được xóa thành công' },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token không hợp lệ' })
  @ApiNotFoundResponse({ description: 'Transaction không tồn tại' })
  async delete(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ) {
    if (!authHeader) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
    const transaction = await this.transactionsService.findOne(+id);
    if (!transaction) {
      throw new NotFoundException('Transaction không tồn tại');
    }
    await this.transactionsService.delete(+id);
    return { message: 'Transaction đã được xóa thành công' };
  }
}
