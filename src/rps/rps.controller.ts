import {
  BadRequestException,
  Body,
  Controller,
  Post,
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
import { memoryStorage } from 'multer';
import { RpsService } from './rps.service.js';
import { ImportRpsDto } from './dto/import-rps.dto.js';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('RPS Parser & Importer')
@ApiBearerAuth()
@Controller('rps')
export class RpsController {
  constructor(private readonly rpsService: RpsService) {}

  @Post('parse')
  @ApiOperation({ summary: 'Unggah berkas PDF RPS untuk diekstrak struktur mata kuliah dan pertemuannya' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Berkas PDF RPS (maks 10MB)',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype === 'application/pdf' ||
          file.originalname.toLowerCase().endsWith('.pdf')
        ) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Format berkas harus berupa dokumen PDF (.pdf)'), false);
        }
      },
    }),
  )
  async parseRps(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Berkas PDF RPS tidak ditemukan dalam permintaan');
    }

    return this.rpsService.parseRpsPdf(file.buffer);
  }

  @Post('import')
  @ApiOperation({ summary: 'Impor jadwal agenda dari hasil parsing RPS ke database' })
  @ApiResponse({ status: 201, description: 'Jadwal RPS berhasil diimpor' })
  async importRps(
    @CurrentUser() user: AuthUser,
    @Body() dto: ImportRpsDto,
  ) {
    return this.rpsService.importRps(user.id, dto);
  }
}
