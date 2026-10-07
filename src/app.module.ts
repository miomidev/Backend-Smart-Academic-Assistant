import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module.js';
import { HealthModule } from './health/health.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { CoursesModule } from './courses/courses.module.js';
import { SchedulesModule } from './schedules/schedules.module.js';
import { NotesModule } from './notes/notes.module.js';
import { FocusModule } from './focus/focus.module.js';
import { RpsModule } from './rps/rps.module.js';
import { AuthGuard } from './common/guards/auth.guard.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    SchedulesModule,
    NotesModule,
    FocusModule,
    RpsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
