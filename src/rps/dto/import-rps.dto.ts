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
import { CreateCourseDto } from '../../courses/dto/create-course.dto.js';

export class RpsScheduleItemDto {
  @ApiProperty({ description: 'Judul kegiatan atau materi', example: 'Pertemuan 1: Pengantar Basis Data' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: ScheduleType, description: 'Tipe jadwal: CLASS, TASK, atau EXAM', example: 'CLASS' })
  @IsEnum(ScheduleType)
  type: ScheduleType;

  @ApiPropertyOptional({ description: 'Nomor pertemuan (1-16)', example: 1 })
  @IsInt()
  @IsOptional()
  meetingNumber?: number;

  @ApiProperty({ description: 'Tenggat waktu atau jadwal pelaksanaan (ISO 8601)', example: '2025-02-10T08:00:00.000Z' })
  @IsISO8601()
  dueDate: string;

  @ApiPropertyOptional({ description: 'Notifikasi sebelum deadline (menit)', example: 60, default: 60 })
  @IsInt()
  @IsOptional()
  reminderMinutes?: number;
}

export class ImportRpsDto {
  @ApiPropertyOptional({ description: 'ID mata kuliah yang sudah ada (jika tidak membuat mata kuliah baru)' })
  @IsUUID('4')
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Buat mata kuliah baru secara otomatis', default: true })
  @IsBoolean()
  @IsOptional()
  createCourse?: boolean;

  @ApiPropertyOptional({ description: 'Data informasi mata kuliah baru', type: CreateCourseDto })
  @ValidateNested()
  @Type(() => CreateCourseDto)
  @IsOptional()
  courseData?: CreateCourseDto;

  @ApiProperty({ description: 'Daftar jadwal agenda pertemuan/tugas hasil ekstraksi RPS', type: [RpsScheduleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RpsScheduleItemDto)
  schedules: RpsScheduleItemDto[];
}
