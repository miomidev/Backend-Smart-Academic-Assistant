import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class PreviewAutoTagDto {
  @ApiPropertyOptional({ description: 'Judul catatan / sesi', example: 'Catatan Basis Data Normalisasi' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Transkrip suara atau ringkasan materi', example: 'Materi hari ini mengenai tabel relasi dan foreign key' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Waktu sesi dicatat (ISO 8601 UTC)', example: '2025-03-05T08:15:00.000Z' })
  @IsISO8601()
  @IsOptional()
  recordedAt?: string;
}
