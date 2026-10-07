import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';
import { RpsModule } from '../rps/rps.module.js';

@Module({
  imports: [RpsModule],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
