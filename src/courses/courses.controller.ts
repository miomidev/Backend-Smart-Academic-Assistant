import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { QueryCourseDto } from './dto/query-course.dto.js';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil daftar seluruh mata kuliah pengguna aktif' })
  @ApiResponse({ status: 200, description: 'Daftar mata kuliah berhasil diambil' })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryCourseDto,
  ) {
    return this.coursesService.findAll(user.id, query);
  }

  @Post()
  @ApiOperation({ summary: 'Tambah mata kuliah baru beserta slot jadwal' })
  @ApiResponse({ status: 201, description: 'Mata kuliah berhasil ditambahkan' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCourseDto,
  ) {
    return this.coursesService.create(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail mata kuliah berdasarkan ID' })
  @ApiResponse({ status: 200, description: 'Detail mata kuliah berhasil diambil' })
  async findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.coursesService.findOne(user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Perbarui informasi mata kuliah dan slot jadwal' })
  @ApiResponse({ status: 200, description: 'Mata kuliah berhasil diperbarui' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus mata kuliah (soft delete)' })
  @ApiResponse({ status: 200, description: 'Mata kuliah berhasil dihapus' })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.coursesService.remove(user.id, id);
  }
}
