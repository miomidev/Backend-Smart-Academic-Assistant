import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ScheduleType } from '@prisma/client';

export class CreateScheduleDto {
  @ApiProperty({ description: 'ID Mata Kuliah terkait', example: '11111111-1111-1111-1111-111111111111' })
  @IsUUID('4', { message: 'courseId harus berupa UUID v4 yang valid' })
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: 'Judul kegiatan / agenda / tugas', example: 'Tugas 1: ERD Basis Data SAA' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150, { message: 'Judul maksimal 150 karakter' })
  title: string;

  @ApiProperty({ enum: ScheduleType, description: 'Tipe jadwal: CLASS, TASK, atau EXAM', example: 'TASK' })
  @IsEnum(ScheduleType, { message: 'type harus salah satu dari: CLASS, TASK, EXAM' })
  type: ScheduleType;

  @ApiPropertyOptional({ description: 'Pertemuan ke berapa (opsional)', example: 3 })
  @IsInt()
  @Min(1)
  @Max(30)
  @IsOptional()
  meetingNumber?: number;

  @ApiProperty({ description: 'Waktu pelaksanaan atau tenggat waktu (ISO 8601 UTC)', example: '2025-03-05T16:59:00.000Z' })
  @IsISO8601({}, { message: 'dueDate harus berupa format ISO 8601 yang valid' })
  dueDate: string;

  @ApiPropertyOptional({ description: 'Waktu notifikasi sebelum deadline (dalam menit)', example: 60, default: 60 })
  @IsInt()
  @Min(0)
  @IsOptional()
  reminderMinutes?: number;

  @ApiPropertyOptional({ description: 'Sumber pembuatan jadwal: MANUAL atau RPS', example: 'MANUAL', default: 'MANUAL' })
  @IsString()
  @IsOptional()
  source?: string;
}
