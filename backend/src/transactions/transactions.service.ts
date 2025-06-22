/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PaginatedResponseDto } from './dto/pagination.dto';
import { User } from '../users/entities/user.entity';
import { EmailTemplate } from '../email-templates/entities/email-template.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    userEmail: string,
  ): Promise<Transaction> {
    // Look up the user by email
    const user = await this.usersRepository.findOne({
      where: { email: userEmail },
    });
    if (!user) {
      throw new NotFoundException(
        `Không tìm thấy người dùng với email ${userEmail}`,
      );
    }

    // Look up the email template if emailTemplateId is provided
    let emailTemplate: EmailTemplate | undefined;
    if (createTransactionDto.emailTemplateId) {
      const foundEmailTemplate = await this.emailTemplateRepository.findOne({
        where: { id: createTransactionDto.emailTemplateId },
      });
      emailTemplate = foundEmailTemplate ?? undefined;
      if (!emailTemplate) {
        throw new NotFoundException(
          `Không tìm thấy email template với ID ${createTransactionDto.emailTemplateId}`,
        );
      }
    }

    // Create the transaction with relationships
    const transaction = this.transactionsRepository.create({
      ...createTransactionDto,
      user,
      emailTemplate,
      createdBy: userEmail, // Use the authenticated user's email
    });

    return this.transactionsRepository.save(transaction);
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      relations: ['emailTemplate', 'user'],
    });
  }

  async findAllByUser(userEmail: string): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: { createdBy: userEmail },
      relations: ['emailTemplate', 'user'],
      order: { id: 'DESC' },
    });
  }

  async findAllPaginated(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponseDto<Transaction>> {
    const skip = (page - 1) * limit;

    let queryBuilder = this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.emailTemplate', 'emailTemplate')
      .leftJoinAndSelect('transaction.user', 'user');

    // Add search functionality
    if (search) {
      queryBuilder = queryBuilder.where(
        '(transaction.title ILIKE :search OR transaction.body ILIKE :search OR transaction.sender ILIKE :search OR transaction.receivers ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [transactions, totalItems] = await queryBuilder
      .orderBy('transaction.id', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: transactions,
      meta: {
        totalItems,
        itemCount: transactions.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  async findAllPaginatedByUser(
    userEmail: string,
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponseDto<Transaction>> {
    const skip = (page - 1) * limit;

    let queryBuilder = this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.emailTemplate', 'emailTemplate')
      .leftJoinAndSelect('transaction.user', 'user')
      .where('transaction.createdBy = :userEmail', { userEmail });

    // Add search functionality
    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(transaction.title ILIKE :search OR transaction.body ILIKE :search OR transaction.sender ILIKE :search OR transaction.receivers ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [transactions, totalItems] = await queryBuilder
      .orderBy('transaction.id', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: transactions,
      meta: {
        totalItems,
        itemCount: transactions.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  async findOne(id: number): Promise<Transaction | null> {
    return this.transactionsRepository.findOne({
      where: { id },
      relations: ['emailTemplate', 'user'],
    });
  }

  async findOneByUser(
    id: number,
    userEmail: string,
  ): Promise<Transaction | null> {
    return this.transactionsRepository.findOne({
      where: { id, createdBy: userEmail },
      relations: ['emailTemplate', 'user'],
    });
  }

  async delete(id: number): Promise<void> {
    await this.transactionsRepository.delete(id);
  }
}
