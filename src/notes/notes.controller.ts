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
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { NotesService } from './notes.service.js';
import { CreateNoteDto } from './dto/create-note.dto.js';
import { UpdateNoteDto } from './dto/update-note.dto.js';
import { QueryNoteDto } from './dto/query-note.dto.js';
import { ConfirmTagDto } from './dto/confirm-tag.dto.js';
import { PreviewAutoTagDto } from './dto/preview-auto-tag.dto.js';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Notes & Transcripts')
@ApiBearerAuth()
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil daftar catatan dan transkrip dengan pagination dan pencarian' })
  @ApiResponse({ status: 200, description: 'Daftar catatan berhasil diambil' })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryNoteDto,
  ) {
    return this.notesService.findAll(user.id, query);
  }

  @Post()
  @ApiOperation({ summary: 'Simpan catatan / hasil transkrip suara (idempoten UUID dari klien)' })
  @ApiResponse({ status: 201, description: 'Catatan berhasil disimpan' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.create(user.id, dto);
  }

  @Post('auto-tag/preview')
  @ApiOperation({ summary: 'Pratinjau deteksi pintar auto-tag mata kuliah sebelum disimpan' })
  @ApiResponse({ status: 200, description: 'Hasil deteksi auto-tag berhasil dihitung' })
  async previewAutoTag(
    @CurrentUser() user: AuthUser,
    @Body() dto: PreviewAutoTagDto,
  ) {
    return this.notesService.previewAutoTag(user.id, dto);
  }

  @Post('suggest-course')
  @ApiOperation({ summary: 'Saran mata kuliah otomatis dari teks transkrip / catatan (alias PRD)' })
  @ApiResponse({ status: 200, description: 'Hasil deteksi auto-tag berhasil dihitung' })
  async suggestCourse(
    @CurrentUser() user: AuthUser,
    @Body() dto: PreviewAutoTagDto,
  ) {
    return this.notesService.previewAutoTag(user.id, dto);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Unggah berkas audio rekaman atau dokumen lampiran' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${randomUUID()}`;
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'audio/wav',
          'audio/x-wav',
          'audio/mp4',
          'audio/m4a',
          'audio/x-m4a',
          'audio/mpeg',
          'audio/aac',
          'application/pdf',
        ];
        if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(m4a|mp3|wav|aac|pdf)$/i)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Format berkas tidak didukung. Harap unggah audio atau PDF.'), false);
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Berkas tidak ditemukan dalam request');
    }

    return {
      fileUrl: `/uploads/${file.filename}`,
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail catatan berdasarkan ID' })
  @ApiResponse({ status: 200, description: 'Detail catatan berhasil diambil' })
  async findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notesService.findOne(user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Perbarui judul, isi, atau mata kuliah catatan (PUT)' })
  @ApiResponse({ status: 200, description: 'Catatan berhasil diperbarui' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.update(user.id, id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Perbarui judul, isi, atau mata kuliah catatan (PATCH)' })
  @ApiResponse({ status: 200, description: 'Catatan berhasil diperbarui' })
  async patch(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.update(user.id, id, dto);
  }

  @Post(':id/confirm-tag')
  @ApiOperation({ summary: 'Konfirmasi atau ubah tag mata kuliah pada catatan' })
  @ApiResponse({ status: 200, description: 'Tag mata kuliah berhasil dikonfirmasi' })
  async confirmTag(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfirmTagDto,
  ) {
    return this.notesService.confirmTag(user.id, id, dto.courseId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus catatan (soft delete)' })
  @ApiResponse({ status: 200, description: 'Catatan berhasil dihapus' })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notesService.remove(user.id, id);
  }
}
