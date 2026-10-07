import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { FocusStatus } from '@prisma/client';

export class QueryFocusSessionsDto {
  @ApiPropertyOptional({ enum: FocusStatus, description: 'Filter status sesi: COMPLETED atau FAILED' })
  @IsEnum(FocusStatus)
  @IsOptional()
  status?: FocusStatus;

  @ApiPropertyOptional({ description: 'Nomor halaman pagination', default: 1 })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Jumlah item per halaman (maks 50)', default: 20 })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number = 20;
}
