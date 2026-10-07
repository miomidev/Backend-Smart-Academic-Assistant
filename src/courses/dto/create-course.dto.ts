import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CourseSlotDto } from './course-slot.dto.js';

export class CreateCourseDto {
  @ApiProperty({ description: 'Nama mata kuliah', example: 'Pemrograman Web Lanjut' })
  @IsString()
  @IsNotEmpty({ message: 'Nama mata kuliah tidak boleh kosong' })
  @MaxLength(100, { message: 'Nama mata kuliah maksimal 100 karakter' })
  name: string;

  @ApiPropertyOptional({ description: 'Kode mata kuliah', example: 'IF2104' })
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'Kode mata kuliah maksimal 20 karakter' })
  code?: string;

  @ApiPropertyOptional({ description: 'Nama dosen pengampu', example: 'Dr. Ir. Budi Santoso, M.Kom.' })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Nama dosen maksimal 100 karakter' })
  lecturer?: string;

  @ApiProperty({ description: 'Kode warna hex (#RRGGBB)', example: '#4A90E2' })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'colorCode harus berupa format hex 6 karakter (contoh: #4A90E2)' })
  colorCode: string;

  @ApiPropertyOptional({ description: 'Tanggal awal perkuliahan (YYYY-MM-DD)', example: '2025-02-10' })
  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate harus berformat YYYY-MM-DD' })
  startDate?: string;

  @ApiPropertyOptional({ description: 'Kata kunci pendeteksi otomatis auto-tag', example: ['web', 'backend', 'laravel', 'express'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];

  @ApiPropertyOptional({ description: 'Daftar jadwal berulang mingguan (course slots)', type: [CourseSlotDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseSlotDto)
  @IsOptional()
  slots?: CourseSlotDto[];
}
