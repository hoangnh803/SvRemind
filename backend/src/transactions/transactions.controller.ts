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
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
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

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const transaction = await this.transactionsService.findOne(+id);
    if (transaction === undefined || transaction === null) {
      throw new NotFoundException('Transaction không tồn tại');
    }
    return transaction;
  }
  @Delete(':id')
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
