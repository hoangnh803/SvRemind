/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto, ChartDataPointDto } from './dto/dashboard.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @Get('users')
  @ApiOperation({ summary: 'Get daily user counts (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of daily user counts',
    type: [ChartDataPointDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin role required' })
  async getUsers(
    @Query() query: DashboardQueryDto,
  ): Promise<ChartDataPointDto[]> {
    return this.dashboardService.getUsers(query.timeRange);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @Get('emails')
  @ApiOperation({ summary: 'Get daily email sent counts (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of daily email sent counts',
    type: [ChartDataPointDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin role required' })
  async getEmails(
    @Query() query: DashboardQueryDto,
  ): Promise<ChartDataPointDto[]> {
    return this.dashboardService.getEmails(query.timeRange);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @Get('student-cards')
  @ApiOperation({ summary: 'Get daily student card scan counts (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of daily student card scan counts',
    type: [ChartDataPointDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin role required' })
  async getStudentCards(
    @Query() query: DashboardQueryDto,
  ): Promise<ChartDataPointDto[]> {
    return this.dashboardService.getStudentCards(query.timeRange);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('user/emails')
  @ApiOperation({
    summary: 'Get daily email sent counts for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of daily email sent counts for the user',
    type: [ChartDataPointDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserEmails(
    @Req() req,
    @Query() query: DashboardQueryDto,
  ): Promise<ChartDataPointDto[]> {
    return this.dashboardService.getUserEmails(req.user.email, query.timeRange);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('user/student-cards')
  @ApiOperation({
    summary: 'Get daily student card scan counts for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of daily student card scan counts for the user',
    type: [ChartDataPointDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserStudentCards(
    @Req() req,
    @Query() query: DashboardQueryDto,
  ): Promise<ChartDataPointDto[]> {
    return this.dashboardService.getUserStudentCards(
      req.user.id,
      query.timeRange,
    );
  }
}
