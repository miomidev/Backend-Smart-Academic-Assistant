import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { FocusStatus, FailReason } from '@prisma/client';

export class RecordSessionDto {
  @ApiProperty({ description: 'UUID v4 sesi fokus dari client (idempoten)', example: 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e' })
  @IsUUID('4', { message: 'id harus berupa UUID v4 yang valid' })
  @IsNotEmpty()
  id: string;

  @ApiPropertyOptional({ description: 'ID jadwal agenda yang sedang dikerjakan', example: '11111111-1111-1111-1111-111111111111' })
  @IsUUID('4')
  @IsOptional()
  scheduleId?: string;

  @ApiProperty({ description: 'Target durasi fokus yang direncanakan dalam detik (misal 25 menit = 1500)', example: 1500 })
  @IsInt()
  @Min(60, { message: 'Durasi rencana minimal 60 detik (1 menit)' })
  plannedSeconds: number;

  @ApiProperty({ description: 'Durasi fokus riil yang berhasil dicapai dalam detik', example: 1500 })
  @IsInt()
  @Min(0)
  actualSeconds: number;

  @ApiProperty({ enum: FocusStatus, description: 'Status sesi: COMPLETED atau FAILED', example: 'COMPLETED' })
  @IsEnum(FocusStatus, { message: 'status harus COMPLETED atau FAILED' })
  status: FocusStatus;

  @ApiPropertyOptional({ enum: FailReason, description: 'Alasan kegagalan jika status FAILED', example: 'APP_BACKGROUNDED' })
  @IsEnum(FailReason)
  @IsOptional()
  failReason?: FailReason;

  @ApiProperty({ description: 'Waktu sesi dimulai (ISO 8601 UTC)', example: '2025-03-01T08:00:00.000Z' })
  @IsISO8601()
  @IsNotEmpty()
  startedAt: string;

  @ApiProperty({ description: 'Waktu sesi berakhir (ISO 8601 UTC)', example: '2025-03-01T08:25:00.000Z' })
  @IsISO8601()
  @IsNotEmpty()
  endedAt: string;
}
