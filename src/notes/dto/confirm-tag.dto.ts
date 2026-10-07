import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ConfirmTagDto {
  @ApiProperty({ description: 'ID mata kuliah yang dikonfirmasi oleh pengguna', example: '11111111-1111-1111-1111-111111111111' })
  @IsUUID('4', { message: 'courseId harus berupa UUID v4 yang valid' })
  @IsNotEmpty()
  courseId: string;
}
