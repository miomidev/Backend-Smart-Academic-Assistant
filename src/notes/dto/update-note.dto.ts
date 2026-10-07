import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateNoteDto } from './create-note.dto.js';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateNoteDto extends PartialType(CreateNoteDto) {
  @ApiPropertyOptional({ description: 'ID mata kuliah baru (atau null untuk unassign)', example: '11111111-1111-1111-1111-111111111111' })
  @IsUUID('4')
  @IsOptional()
  override courseId?: string;
}
