import {
  BadRequestException,
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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CoursesService } from './courses.service.js';
import { RpsService } from '../rps/rps.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { QueryCourseDto } from './dto/query-course.dto.js';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly rpsService: RpsService,
  ) {}

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
  @ApiOperation({ summary: 'Perbarui informasi mata kuliah dan slot jadwal (PUT)' })
  @ApiResponse({ status: 200, description: 'Mata kuliah berhasil diperbarui' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.update(user.id, id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Perbarui informasi mata kuliah dan slot jadwal (PATCH)' })
  @ApiResponse({ status: 200, description: 'Mata kuliah berhasil diperbarui' })
  async patch(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.update(user.id, id, dto);
  }

  @Post(':id/rps/extract')
  @ApiOperation({ summary: 'Ekstrak RPS PDF langsung untuk mata kuliah tertentu' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        startDate: { type: 'string', example: '2026-09-07' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Hanya berkas PDF yang diperbolehkan'), false);
        }
      },
    }),
  )
  async extractRpsForCourse(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('startDate') startDate?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Berkas PDF tidak ditemukan dalam request');
    }
    const course = await this.coursesService.findOne(user.id, id);
    const parsed = await this.rpsService.parseRpsPdf(file.buffer);
    return {
      courseId: course.id,
      courseName: course.name,
      startDate: startDate || course.startDate || null,
      courseCode: course.code,
      lecturer: course.lecturer,
      totalMeetings: parsed.totalMeetings,
      meetings: parsed.meetings,
    };
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
