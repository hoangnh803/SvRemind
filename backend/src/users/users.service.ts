import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { PaginatedResponseDto } from './dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<UserDto[]> {
    const users = await this.usersRepository.find({
      relations: ['role', 'studentCards', 'emailTemplates', 'transactions'],
    });
    console.log(
      'Raw users:',
      users.map((u) => ({
        id: u.id,
        emailTemplates: u.emailTemplates?.length,
        transactions: u.transactions?.length,
      })),
    );
    return users.map((user) => this.toUserDto(user));
  }

  async findAllPaginated(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponseDto<UserDto>> {
    const skip = (page - 1) * limit;

    let queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.studentCards', 'studentCards')
      .leftJoinAndSelect('user.emailTemplates', 'emailTemplates')
      .leftJoinAndSelect('user.transactions', 'transactions');

    // Add search functionality
    if (search) {
      queryBuilder = queryBuilder.where(
        '(user.email ILIKE :search OR user.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [users, totalItems] = await queryBuilder
      .orderBy('user.id', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);
    const data = users.map((user) => this.toUserDto(user));

    return {
      data,
      meta: {
        totalItems,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  async findOne(id: number): Promise<UserDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role', 'studentCards', 'emailTemplates', 'transactions'],
    });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }
    return this.toUserDto(user);
  }

  private toUserDto(user: User): UserDto {
    console.log('User transactions:', user.transactions);
    return {
      id: user.id,
      email: user.email,
      description: user.description,
      createdDate: user.createdDate,
      latestData: user.latestData,
      role: user.role ? { id: user.role.id, name: user.role.name } : undefined,
      studentCards: user.studentCards
        ? user.studentCards.map((card) => ({
            id: card.id,
            cardCode: card.cardCode,
          }))
        : undefined,
      emailTemplates: user.emailTemplates
        ? user.emailTemplates.map((template) => ({
            id: template.id,
            name: template.name,
            title: template.title,
          }))
        : undefined,
      transactions: user.transactions
        ? user.transactions.map((transaction) => ({
            id: transaction.id,
            sender: transaction.sender,
            receivers: transaction.receivers,
            title: transaction.title,
          }))
        : undefined,
    };
  }
}
