import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service.js';
import { CreateScheduleDto } from './dto/create-schedule.dto.js';
import { UpdateScheduleDto } from './dto/update-schedule.dto.js';
import { QueryScheduleDto } from './dto/query-schedule.dto.js';
import { BulkCreateScheduleDto } from './dto/bulk-create-schedule.dto.js';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Schedules')
@ApiBearerAuth()
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil daftar jadwal / agenda dengan filter rentang waktu dan tipe' })
  @ApiResponse({ status: 200, description: 'Daftar jadwal berhasil diambil' })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryScheduleDto,
  ) {
    return this.schedulesService.findAll(user.id, query);
  }

  @Post()
  @ApiOperation({ summary: 'Tambah jadwal baru secara manual atau terstruktur' })
  @ApiResponse({ status: 201, description: 'Jadwal berhasil ditambahkan' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateScheduleDto,
  ) {
    return this.schedulesService.create(user.id, dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Simpan daftar jadwal perkuliahan secara massal (hasil review RPS)' })
  @ApiResponse({ status: 201, description: 'Daftar jadwal massal berhasil disimpan' })
  async bulkCreate(
    @CurrentUser() user: AuthUser,
    @Body() dto: BulkCreateScheduleDto,
  ) {
    return this.schedulesService.bulkCreate(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail jadwal berdasarkan ID' })
  @ApiResponse({ status: 200, description: 'Detail jadwal berhasil diambil' })
  async findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.schedulesService.findOne(user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Perbarui informasi jadwal (PUT)' })
  @ApiResponse({ status: 200, description: 'Jadwal berhasil diperbarui' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(user.id, id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Perbarui informasi jadwal (PATCH)' })
  @ApiResponse({ status: 200, description: 'Jadwal berhasil diperbarui' })
  async patch(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(user.id, id, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle status penyelesaian tugas (isCompleted true/false)' })
  @ApiResponse({ status: 200, description: 'Status penyelesaian jadwal berhasil diubah' })
  async toggle(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.schedulesService.toggle(user.id, id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Tandai selesai / belum selesai (alias toggle)' })
  @ApiResponse({ status: 200, description: 'Status penyelesaian jadwal berhasil diubah' })
  async complete(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.schedulesService.toggle(user.id, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus jadwal' })
  @ApiResponse({ status: 200, description: 'Jadwal berhasil dihapus' })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.schedulesService.remove(user.id, id);
  }
}
