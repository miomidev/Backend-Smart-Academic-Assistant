import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsISO8601, IsOptional, IsUUID } from 'class-validator';
import { ScheduleType } from '@prisma/client';

export class QueryScheduleDto {
  @ApiPropertyOptional({ description: 'Filter rentang awal (ISO 8601)', example: '2025-03-01T00:00:00Z' })
  @IsISO8601()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ description: 'Filter rentang akhir (ISO 8601)', example: '2025-03-07T23:59:59Z' })
  @IsISO8601()
  @IsOptional()
  to?: string;

  @ApiPropertyOptional({ description: 'Filter berdasarkan ID mata kuliah' })
  @IsUUID('4')
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({ enum: ScheduleType, description: 'Filter berdasarkan tipe jadwal' })
  @IsEnum(ScheduleType)
  @IsOptional()
  type?: ScheduleType;

  @ApiPropertyOptional({ description: 'Filter berdasarkan status selesai (true/false)' })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}
