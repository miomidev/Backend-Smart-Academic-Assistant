import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class QueryFocusStatsDto {
  @ApiPropertyOptional({
    description: 'Periode kalkulasi statistik: today, week, month, atau all',
    example: 'today',
    enum: ['today', 'week', 'month', 'all'],
    default: 'today',
  })
  @IsIn(['today', 'week', 'month', 'all'], { message: 'period harus salah satu dari: today, week, month, all' })
  @IsOptional()
  period?: 'today' | 'week' | 'month' | 'all' = 'today';
}
