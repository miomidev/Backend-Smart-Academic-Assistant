import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FocusService } from './focus.service.js';
import { RecordSessionDto } from './dto/record-session.dto.js';
import { QueryFocusStatsDto } from './dto/query-focus-stats.dto.js';
import { QueryFocusSessionsDto } from './dto/query-focus-sessions.dto.js';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Focus Timer')
@ApiBearerAuth()
@Controller('focus')
export class FocusController {
  constructor(private readonly focusService: FocusService) {}

  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Simpan riwayat sesi fokus Pomodoro (idempoten UUID dari klien)' })
  @ApiResponse({ status: 201, description: 'Sesi fokus berhasil dicatat' })
  async recordSession(
    @CurrentUser() user: AuthUser,
    @Body() dto: RecordSessionDto,
  ) {
    return this.focusService.recordSession(user.id, dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Ambil ringkasan statistik fokus (harian, mingguan, bulanan)' })
  @ApiResponse({ status: 200, description: 'Statistik fokus berhasil diambil' })
  async getStats(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryFocusStatsDto,
  ) {
    return this.focusService.getStats(user.id, query.period);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Ambil daftar riwayat sesi fokus dengan pagination' })
  @ApiResponse({ status: 200, description: 'Daftar sesi fokus berhasil diambil' })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryFocusSessionsDto,
  ) {
    return this.focusService.findAll(user.id, query);
  }
}
