import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class CourseSlotDto {
  @ApiPropertyOptional({ description: 'Slot ID (jika update slot yang sudah ada)' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Hari dalam sepekan: 1 = Senin, 2 = Selasa, ..., 7 = Minggu', example: 1, minimum: 1, maximum: 7 })
  @IsInt({ message: 'dayOfWeek harus berupa bilangan bulat' })
  @Min(1, { message: 'dayOfWeek minimal 1 (Senin)' })
  @Max(7, { message: 'dayOfWeek maksimal 7 (Minggu)' })
  dayOfWeek: number;

  @ApiProperty({ description: 'Jam mulai (format HH:mm)', example: '08:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'startTime harus berformat HH:mm (00:00 - 23:59)' })
  startTime: string;

  @ApiProperty({ description: 'Jam selesai (format HH:mm)', example: '09:40' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'endTime harus berformat HH:mm (00:00 - 23:59)' })
  endTime: string;

  @ApiPropertyOptional({ description: 'Ruang kelas atau laboratorium', example: 'Lab Komputer 2 / Gedung F' })
  @IsString()
  @IsOptional()
  room?: string;
}
