import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { FirebaseService } from './firebase.service.js';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, FirebaseService],
  exports: [AuthService, FirebaseService],
})
export class AuthModule {}
