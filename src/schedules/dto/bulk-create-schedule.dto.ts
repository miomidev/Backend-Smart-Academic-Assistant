import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ScheduleType } from '@prisma/client';

export class BulkScheduleItemDto {
  @ApiPropertyOptional({ description: 'Nomor pertemuan (opsional)', example: 1 })
  @IsInt()
  @IsOptional()
  meeting?: number;

  @ApiPropertyOptional({ description: 'Nomor pertemuan (alias meetingNumber)', example: 1 })
  @IsInt()
  @IsOptional()
  meetingNumber?: number;

  @ApiProperty({ description: 'Judul topik perkuliahan / ujian', example: 'Pengenalan Sistem' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: ScheduleType, description: 'Tipe: CLASS, TASK, EXAM', example: 'CLASS' })
  @IsEnum(ScheduleType)
  type: ScheduleType;

  @ApiProperty({ description: 'Waktu pelaksanaan (ISO 8601 UTC)', example: '2026-09-07T01:00:00Z' })
  @IsISO8601()
  dueDate: string;

  @ApiPropertyOptional({ description: 'Waktu reminder sebelum acara (menit)', example: 60, default: 60 })
  @IsInt()
  @IsOptional()
  reminderMinutes?: number;
}

export class BulkCreateScheduleDto {
  @ApiProperty({ description: 'ID Mata kuliah terkait', example: '7b1f3c4e-0000-0000-0000-000000000001' })
  @IsUUID('4')
  @IsNotEmpty()
  courseId: string;

  @ApiPropertyOptional({ description: 'Hapus jadwal lama dari RPS sebelum menyimpan yang baru', default: true })
  @IsBoolean()
  @IsOptional()
  replaceExistingFromRps?: boolean;

  @ApiProperty({ type: [BulkScheduleItemDto], description: 'Daftar pertemuan / jadwal untuk disimpan' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkScheduleItemDto)
  items: BulkScheduleItemDto[];
}
