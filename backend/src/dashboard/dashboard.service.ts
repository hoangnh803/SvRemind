import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { StudentCard } from '../student-cards/entities/student-card.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(StudentCard)
    private studentCardRepository: Repository<StudentCard>,
  ) {}

  private getDateFilter(timeRange: string | undefined) {
    const now = new Date();
    let startDate: Date | undefined;

    switch (timeRange) {
      case '1y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case '90d':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case '30d':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '7d':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'all':
      default:
        startDate = undefined;
    }

    return startDate;
  }

  async getUsers(timeRange: string | undefined) {
    const startDate = this.getDateFilter(timeRange);
    const query = this.userRepository
      .createQueryBuilder('user')
      .select("TO_CHAR(user.createdDate, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)::integer', 'count')
      .groupBy("TO_CHAR(user.createdDate, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(user.createdDate, 'YYYY-MM-DD')");

    if (startDate) {
      query.where('user.createdDate >= :startDate', { startDate });
    }

    return query.getRawMany();
  }

  async getEmails(timeRange: string | undefined) {
    const startDate = this.getDateFilter(timeRange);
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .select("TO_CHAR(transaction.sendDate, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)::integer', 'count')
      .groupBy("TO_CHAR(transaction.sendDate, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(transaction.sendDate, 'YYYY-MM-DD')");

    if (startDate) {
      query.where('transaction.sendDate >= :startDate', { startDate });
    }

    return query.getRawMany();
  }

  async getStudentCards(timeRange: string | undefined) {
    const startDate = this.getDateFilter(timeRange);
    const query = this.studentCardRepository
      .createQueryBuilder('studentCard')
      .select("TO_CHAR(studentCard.createdDate, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)::integer', 'count')
      .groupBy("TO_CHAR(studentCard.createdDate, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(studentCard.createdDate, 'YYYY-MM-DD')");

    if (startDate) {
      query.where('studentCard.createdDate >= :startDate', { startDate });
    }

    return query.getRawMany();
  }

  async getUserEmails(userEmail: string, timeRange: string | undefined) {
    const startDate = this.getDateFilter(timeRange);
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .select("TO_CHAR(transaction.sendDate, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)::integer', 'count')
      .where('transaction.createdBy = :userEmail', { userEmail })
      .groupBy("TO_CHAR(transaction.sendDate, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(transaction.sendDate, 'YYYY-MM-DD')");

    if (startDate) {
      query.andWhere('transaction.sendDate >= :startDate', { startDate });
    }

    return query.getRawMany();
  }

  async getUserStudentCards(userId: number, timeRange: string | undefined) {
    const startDate = this.getDateFilter(timeRange);
    const query = this.studentCardRepository
      .createQueryBuilder('studentCard')
      .select("TO_CHAR(studentCard.createdDate, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)::integer', 'count')
      .where('studentCard.userId = :userId', { userId })
      .groupBy("TO_CHAR(studentCard.createdDate, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(studentCard.createdDate, 'YYYY-MM-DD')");

    if (startDate) {
      query.andWhere('studentCard.createdDate >= :startDate', { startDate });
    }

    return query.getRawMany();
  }
}
