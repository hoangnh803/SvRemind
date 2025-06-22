/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  NotFoundException,
  Delete,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Transaction } from './entities/transaction.entity';
import {
  PaginatedTransactionResponseDto,
  TransactionPaginationQueryDto,
} from './dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    email: string;
    id: number;
    role: string;
  };
}

/**
 * Controller xử lý các endpoint liên quan đến giao dịch email
 */
@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Tạo một giao dịch email mới
   * @param createTransactionDto - DTO chứa thông tin giao dịch
   * @param req - Request chứa thông tin user từ JWT
   * @returns Giao dịch đã được tạo
   */
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo giao dịch email mới' })
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
    @Request() req: AuthenticatedRequest,
  ) {
    const userEmail = req.user.email;
    const transaction = await this.transactionsService.create(
      createTransactionDto,
      userEmail,
    );
    return { message: 'Transaction đã được lưu thành công', transaction };
  }

  /**
   * Lấy danh sách giao dịch của user hiện tại
   * @param req - Request chứa thông tin user từ JWT
   * @returns Danh sách giao dịch của user
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lấy danh sách giao dịch của user hiện tại (không phân trang)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách giao dịch của user',
    type: [Transaction],
  })
  @ApiUnauthorizedResponse({ description: 'Token không hợp lệ' })
  findAll(@Request() req: AuthenticatedRequest) {
    const userEmail = req.user.email;
    return this.transactionsService.findAllByUser(userEmail);
  }

  /**
   * Lấy danh sách giao dịch của user hiện tại có phân trang và tìm kiếm
   * @param req - Request chứa thông tin user từ JWT
   * @returns Danh sách giao dịch có phân trang
   */
  @Get('paginated')
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Lấy danh sách giao dịch của user hiện tại có phân trang và tìm kiếm',
  })
  @ApiQuery({ type: TransactionPaginationQueryDto })
  @ApiResponse({
    status: 200,
    description: 'Danh sách giao dịch có phân trang',
    type: PaginatedTransactionResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Token không hợp lệ' })
  async findAllPaginated(
    @Query() paginationQuery: TransactionPaginationQueryDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<PaginatedTransactionResponseDto> {
    const userEmail = req.user.email;
    return await this.transactionsService.findAllPaginatedByUser(
      userEmail,
      paginationQuery.page,
      paginationQuery.limit,
      paginationQuery.search,
    );
  }

  /**
   * Lấy chi tiết một giao dịch theo ID (chỉ của user hiện tại)
   * @param id - ID của giao dịch
   * @param req - Request chứa thông tin user từ JWT
   * @returns Chi tiết giao dịch
   */
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lấy chi tiết giao dịch theo ID (chỉ của user hiện tại)',
  })
  @ApiParam({ name: 'id', description: 'ID của giao dịch', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết giao dịch',
    type: Transaction,
  })
  @ApiNotFoundResponse({
    description: 'Transaction không tồn tại hoặc không thuộc về user',
  })
  @ApiUnauthorizedResponse({ description: 'Token không hợp lệ' })
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userEmail = req.user.email;
    const transaction = await this.transactionsService.findOneByUser(
      +id,
      userEmail,
    );
    if (transaction === undefined || transaction === null) {
      throw new NotFoundException(
        'Transaction không tồn tại hoặc không thuộc về user',
      );
    }
    return transaction;
  }

  /**
   * Xóa một giao dịch theo ID (chỉ của user hiện tại)
   * @param id - ID của giao dịch
   * @param req - Request chứa thông tin user từ JWT
   * @returns Thông báo xóa thành công
   */
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa giao dịch theo ID (chỉ của user hiện tại)' })
  @ApiParam({ name: 'id', description: 'ID của giao dịch', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Giao dịch đã được xóa thành công',
    schema: {
      example: { message: 'Transaction đã được xóa thành công' },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token không hợp lệ' })
  @ApiNotFoundResponse({
    description: 'Transaction không tồn tại hoặc không thuộc về user',
  })
  async delete(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userEmail = req.user.email;
    const transaction = await this.transactionsService.findOneByUser(
      +id,
      userEmail,
    );
    if (!transaction) {
      throw new NotFoundException(
        'Transaction không tồn tại hoặc không thuộc về user',
      );
    }
    await this.transactionsService.delete(+id);
    return { message: 'Transaction đã được xóa thành công' };
  }
}
