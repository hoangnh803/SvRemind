/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpException,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StudentCardsService } from './student-cards.service';
import {
  CreateStudentCardDto,
  CheckStudentCardResponseDto,
} from './dto/student-card.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudentCard } from './entities/student-card.entity';

@ApiTags('student-cards')
@Controller('student-cards')
export class StudentCardsController {
  constructor(private readonly studentCardsService: StudentCardsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new student card' })
  @ApiResponse({
    status: 201,
    description:
      'The student card has been successfully created. The creator email and user ID are derived from the JWT token.',
    type: StudentCard,
  })
  @ApiResponse({
    status: 409,
    description:
      "Student code already exists for the authenticated user's email.",
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async create(
    @Body() createStudentCardDto: CreateStudentCardDto,
    @Req() req,
  ): Promise<StudentCard> {
    try {
      return await this.studentCardsService.create(
        createStudentCardDto,
        req.user,
      );
    } catch (error) {
      if (
        error.message === 'Student code already exists for this creator email'
      ) {
        throw new HttpException(
          'Student code already exists for this creator email',
          HttpStatus.CONFLICT,
        );
      }
      if (error.message === 'User not found') {
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('check')
  @ApiOperation({
    summary:
      "Check if a student card exists for a given student code and the authenticated user's email",
  })
  @ApiQuery({
    name: 'studentCode',
    required: true,
    description: 'The student code to check',
    example: '20210001',
  })
  @ApiResponse({
    status: 200,
    description:
      'Result of the student card existence check. The creator email is derived from the JWT token.',
    type: CheckStudentCardResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async checkStudentCode(
    @Query('studentCode') studentCode: string,
    @Req() req,
  ): Promise<CheckStudentCardResponseDto> {
    const createdBy = req.user.email;
    const exists = await this.studentCardsService.checkStudentCode(
      studentCode,
      createdBy,
    );
    return { exists };
  }
}
