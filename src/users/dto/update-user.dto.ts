import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Nama lengkap user', example: 'Romi Ramadhan' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Asal perguruan tinggi', example: 'Universitas Siliwangi' })
  @IsString()
  @IsOptional()
  university?: string;

  @ApiPropertyOptional({ description: 'Zona waktu pengguna (IANA)', example: 'Asia/Jakarta' })
  @IsString()
  @IsOptional()
  timezone?: string;
}
