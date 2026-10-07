import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AutoTagService } from './auto-tag.service.js';
import { CreateNoteDto } from './dto/create-note.dto.js';
import { UpdateNoteDto } from './dto/update-note.dto.js';
import { QueryNoteDto } from './dto/query-note.dto.js';
import { PreviewAutoTagDto } from './dto/preview-auto-tag.dto.js';

@Injectable()
export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly autoTagService: AutoTagService,
  ) {}

  async findAll(userId: string, query: QueryNoteDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      deletedAt: null,
    };

    if (query.courseId) {
      where.courseId = query.courseId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              code: true,
              colorCode: true,
            },
          },
        },
      }),
      this.prisma.note.count({ where }),
    ]);

    // Format items with suggestedCourse info if available
    const enrichedItems = await Promise.all(
      items.map(async (note) => {
        let suggestedCourse: any = null;
        if (note.suggestedCourseId && !note.courseId) {
          suggestedCourse = await this.prisma.course.findUnique({
            where: { id: note.suggestedCourseId },
            select: { id: true, name: true, code: true, colorCode: true },
          });
        }
        return {
          ...note,
          suggestedCourse,
        };
      }),
    );

    return {
      items: enrichedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, id: string) {
    const note = await this.prisma.note.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            colorCode: true,
          },
        },
      },
    });

    if (!note) {
      throw new NotFoundException({
        code: 'NOTE_NOT_FOUND',
        message: 'Catatan tidak ditemukan',
      });
    }

    let suggestedCourse: any = null;
    if (note.suggestedCourseId && !note.courseId) {
      suggestedCourse = await this.prisma.course.findUnique({
        where: { id: note.suggestedCourseId },
        select: { id: true, name: true, code: true, colorCode: true },
      });
    }

    return {
      ...note,
      suggestedCourse,
    };
  }

  async create(userId: string, dto: CreateNoteDto) {
    let assignedCourseId = dto.courseId || null;
    let suggestedCourseId: string | null = null;
    let confidenceScore: number | null = null;

    if (assignedCourseId) {
      const course = await this.prisma.course.findFirst({
        where: { id: assignedCourseId, userId, deletedAt: null },
      });
      if (!course) {
        throw new BadRequestException({
          code: 'INVALID_COURSE',
          message: 'Mata kuliah yang dipilih tidak valid',
        });
      }
    } else {
      // Jalankan algoritma auto-tagging
      const tagResult = await this.autoTagService.detectCourse(
        userId,
        dto.title,
        dto.content,
        dto.createdAt ? new Date(dto.createdAt) : undefined,
      );
      suggestedCourseId = tagResult.suggestedCourseId;
      confidenceScore = tagResult.confidenceScore;
    }

    const note = await this.prisma.note.upsert({
      where: { id: dto.id },
      update: {
        title: dto.title,
        content: dto.content ?? undefined,
        courseId: assignedCourseId,
        type: dto.type,
        language: dto.language ?? undefined,
        durationSeconds: dto.durationSeconds ?? undefined,
        fileUrl: dto.fileUrl ?? undefined,
        fileName: dto.fileName ?? undefined,
        mimeType: dto.mimeType ?? undefined,
        fileSize: dto.fileSize ?? undefined,
        suggestedCourseId,
        confidenceScore,
      },
      create: {
        id: dto.id,
        userId,
        courseId: assignedCourseId,
        title: dto.title,
        content: dto.content || null,
        type: dto.type,
        language: dto.language || 'id-ID',
        durationSeconds: dto.durationSeconds || null,
        fileUrl: dto.fileUrl || null,
        fileName: dto.fileName || null,
        mimeType: dto.mimeType || null,
        fileSize: dto.fileSize || null,
        suggestedCourseId,
        confidenceScore,
        createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            colorCode: true,
          },
        },
      },
    });

    let suggestedCourse: any = null;
    if (note.suggestedCourseId && !note.courseId) {
      suggestedCourse = await this.prisma.course.findUnique({
        where: { id: note.suggestedCourseId },
        select: { id: true, name: true, code: true, colorCode: true },
      });
    }

    return {
      ...note,
      suggestedCourse,
    };
  }

  async update(userId: string, id: string, dto: UpdateNoteDto) {
    await this.findOne(userId, id);

    let assignedCourseId = dto.courseId;
    if (assignedCourseId) {
      const course = await this.prisma.course.findFirst({
        where: { id: assignedCourseId, userId, deletedAt: null },
      });
      if (!course) {
        throw new BadRequestException({
          code: 'INVALID_COURSE',
          message: 'Mata kuliah yang dipilih tidak valid',
        });
      }
    }

    const updated = await this.prisma.note.update({
      where: { id },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(assignedCourseId !== undefined
          ? {
              courseId: assignedCourseId,
              suggestedCourseId: null,
              confidenceScore: null,
            }
          : {}),
        ...(dto.type ? { type: dto.type } : {}),
        ...(dto.language ? { language: dto.language } : {}),
        ...(dto.durationSeconds !== undefined ? { durationSeconds: dto.durationSeconds } : {}),
        ...(dto.fileUrl !== undefined ? { fileUrl: dto.fileUrl } : {}),
        ...(dto.fileName !== undefined ? { fileName: dto.fileName } : {}),
        ...(dto.mimeType !== undefined ? { mimeType: dto.mimeType } : {}),
        ...(dto.fileSize !== undefined ? { fileSize: dto.fileSize } : {}),
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            colorCode: true,
          },
        },
      },
    });

    return updated;
  }

  async confirmTag(userId: string, id: string, courseId: string) {
    await this.findOne(userId, id);

    const course = await this.prisma.course.findFirst({
      where: { id: courseId, userId, deletedAt: null },
    });

    if (!course) {
      throw new BadRequestException({
        code: 'INVALID_COURSE',
        message: 'Mata kuliah yang dipilih tidak valid',
      });
    }

    return this.prisma.note.update({
      where: { id },
      data: {
        courseId,
        suggestedCourseId: null,
        confidenceScore: null,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            colorCode: true,
          },
        },
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    await this.prisma.note.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      message: 'Catatan berhasil dihapus',
    };
  }

  async previewAutoTag(userId: string, dto: PreviewAutoTagDto) {
    return this.autoTagService.detectCourse(
      userId,
      dto.title,
      dto.content,
      dto.recordedAt ? new Date(dto.recordedAt) : undefined,
    );
  }
}
