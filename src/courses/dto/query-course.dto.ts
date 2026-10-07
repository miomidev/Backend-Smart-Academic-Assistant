import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class QueryCourseDto {
  @ApiPropertyOptional({ description: 'Sertakan relasi course slots mingguan', example: true })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  includeSlots?: boolean;
}
