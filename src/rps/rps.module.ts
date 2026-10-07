import { Module } from '@nestjs/common';
import { RpsController } from './rps.controller.js';
import { RpsService } from './rps.service.js';

@Module({
  controllers: [RpsController],
  providers: [RpsService],
  exports: [RpsService],
})
export class RpsModule {}
