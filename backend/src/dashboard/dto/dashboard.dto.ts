import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChartDataPointDto {
  @ApiProperty({
    description: 'Date in YYYY-MM-DD format',
    example: '2024-06-01',
  })
  date: string;

  @ApiProperty({
    description: 'Count for the day',
    example: 10,
  })
  count: number;
}

export class DashboardQueryDto {
  @ApiProperty({
    description: 'Time range for data filtering (all, 1y, 90d, 30d, 7d)',
    example: '90d',
    required: false,
  })
  @IsString()
  timeRange?: string;
}
