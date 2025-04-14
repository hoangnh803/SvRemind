import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const transaction =
      this.transactionsRepository.create(createTransactionDto);
    return this.transactionsRepository.save(transaction);
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      relations: ['emailTemplate'],
    });
  }

  async findOne(id: number): Promise<Transaction | null> {
    return this.transactionsRepository.findOne({
      where: { id },
      relations: ['emailTemplate'],
    });
  }
  async delete(id: number): Promise<void> {
    await this.transactionsRepository.delete(id);
  }
}
