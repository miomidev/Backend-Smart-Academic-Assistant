import { Module } from '@nestjs/common';
import { FocusController, FocusSessionsController } from './focus.controller.js';
import { FocusService } from './focus.service.js';

@Module({
  controllers: [FocusController, FocusSessionsController],
  providers: [FocusService],
  exports: [FocusService],
})
export class FocusModule {}
