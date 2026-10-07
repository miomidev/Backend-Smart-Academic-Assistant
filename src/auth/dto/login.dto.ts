import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Firebase ID Token yang didapatkan dari Google Sign-In SDK di Flutter', example: 'eyJhbGciOiJSUzI1NiIs...' })
  @IsString()
  @IsNotEmpty({ message: 'idToken tidak boleh kosong' })
  idToken: string;

  @ApiPropertyOptional({ description: 'Nama lengkap user (jika pendaftaran pertama kali)', example: 'Romi Mahasiswa UNSIL' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Asal perguruan tinggi', example: 'Universitas Siliwangi' })
  @IsString()
  @IsOptional()
  university?: string;
}
