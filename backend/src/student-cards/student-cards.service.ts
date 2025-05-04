/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentCard } from './entities/student-card.entity';
import { CreateStudentCardDto } from './dto/student-card.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class StudentCardsService {
  constructor(
    @InjectRepository(StudentCard)
    private studentCardRepository: Repository<StudentCard>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createStudentCardDto: CreateStudentCardDto,
    user: any,
  ): Promise<StudentCard> {
    // Verify user exists
    const userId = user.id;
    const userEntity = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!userEntity) {
      throw new Error('User not found');
    }

    // Check for existing studentCode for this creator's email
    const createdBy = user.email;
    const existingCard = await this.studentCardRepository.findOne({
      where: {
        studentCode: createStudentCardDto.studentCode,
        createdBy: createdBy,
      },
    });
    if (existingCard) {
      throw new Error('Student code already exists for this creator email');
    }

    // Create and save the student card
    const studentCard = this.studentCardRepository.create({
      fullNameNS: createStudentCardDto.fullNameNS,
      studentCode: createStudentCardDto.studentCode,
      email: createStudentCardDto.email,
      cardCode: createStudentCardDto.cardCode,
      createdBy: createdBy,
      user: userEntity,
    });

    return await this.studentCardRepository.save(studentCard);
  }

  async checkStudentCode(
    studentCode: string,
    createdBy: string,
  ): Promise<boolean> {
    const studentCard = await this.studentCardRepository.findOne({
      where: { studentCode, createdBy },
    });
    return !!studentCard;
  }
}
