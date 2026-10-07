import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller.js';
import { NotesService } from './notes.service.js';
import { AutoTagService } from './auto-tag.service.js';

@Module({
  controllers: [NotesController],
  providers: [NotesService, AutoTagService],
  exports: [NotesService, AutoTagService],
})
export class NotesModule {}
