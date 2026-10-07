import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { NoteType } from '@prisma/client';

export class QueryNoteDto {
  @ApiPropertyOptional({ description: 'Filter berdasarkan ID mata kuliah' })
  @IsUUID('4')
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({ enum: NoteType, description: 'Filter berdasarkan tipe catatan' })
  @IsEnum(NoteType)
  @IsOptional()
  type?: NoteType;

  @ApiPropertyOptional({ description: 'Pencarian teks pada judul atau isi catatan' })
  @IsString()
  @IsOptional()
  search?: string;

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
