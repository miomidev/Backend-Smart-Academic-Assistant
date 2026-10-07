import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { NoteType } from '@prisma/client';

export class CreateNoteDto {
  @ApiProperty({
    description: 'UUID v4 catatan yang di-generate di client (idempoten)',
    example: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  })
  @IsUUID('4', { message: 'id harus berupa UUID v4 yang valid dari client' })
  @IsNotEmpty()
  id: string;

  @ApiPropertyOptional({
    description: 'ID mata kuliah (kosongkan jika ingin auto-tagging otomatis)',
    example: '11111111-1111-1111-1111-111111111111',
  })
  @IsUUID('4')
  @IsOptional()
  courseId?: string;

  @ApiProperty({ description: 'Judul catatan / rekaman perkuliahan', example: 'Pertemuan 3: Normalisasi Database' })
  @IsString()
  @IsNotEmpty({ message: 'Judul catatan tidak boleh kosong' })
  title: string;

  @ApiPropertyOptional({ description: 'Teks transkrip atau isi catatan', example: 'Hari ini dosen menjelaskan tentang 1NF, 2NF, dan BCNF...' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ enum: NoteType, description: 'Tipe catatan: VOICE atau DOCUMENT', example: 'VOICE' })
  @IsEnum(NoteType, { message: 'type harus VOICE atau DOCUMENT' })
  type: NoteType;

  @ApiPropertyOptional({ description: 'Bahasa rekaman (id-ID atau en-US)', example: 'id-ID' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ description: 'Durasi rekaman dalam detik', example: 1820 })
  @IsInt()
  @Min(0)
  @IsOptional()
  durationSeconds?: number;

  @ApiPropertyOptional({ description: 'URL berkas rekaman audio atau dokumen', example: '/uploads/audio-123.m4a' })
  @IsString()
  @IsOptional()
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'Nama berkas asli', example: 'rekaman-basisdata.m4a' })
  @IsString()
  @IsOptional()
  fileName?: string;

  @ApiPropertyOptional({ description: 'MIME Type berkas', example: 'audio/mp4' })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiPropertyOptional({ description: 'Ukuran berkas dalam bytes', example: 15400200 })
  @IsInt()
  @IsOptional()
  fileSize?: number;

  @ApiPropertyOptional({ description: 'Waktu pembuatan di perangkat klien (untuk sinkronisasi offline)', example: '2025-03-01T08:30:00.000Z' })
  @IsISO8601()
  @IsOptional()
  createdAt?: string;
}
