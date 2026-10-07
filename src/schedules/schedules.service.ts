import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateScheduleDto } from './dto/create-schedule.dto.js';
import { UpdateScheduleDto } from './dto/update-schedule.dto.js';
import { QueryScheduleDto } from './dto/query-schedule.dto.js';

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: QueryScheduleDto) {
    const where: any = {
      course: {
        userId,
        deletedAt: null,
      },
    };

    if (query.courseId) {
      where.courseId = query.courseId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.isCompleted !== undefined) {
      where.isCompleted = query.isCompleted;
    }

    if (query.from || query.to) {
      where.dueDate = {};
      if (query.from) {
        where.dueDate.gte = new Date(query.from);
      }
      if (query.to) {
        where.dueDate.lte = new Date(query.to);
      }
    }

    return this.prisma.schedule.findMany({
      where,
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
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  async findOne(userId: string, id: string) {
    const schedule = await this.prisma.schedule.findFirst({
      where: {
        id,
        course: {
          userId,
          deletedAt: null,
        },
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

    if (!schedule) {
      throw new NotFoundException({
        code: 'SCHEDULE_NOT_FOUND',
        message: 'Jadwal tidak ditemukan',
      });
    }

    return schedule;
  }

  async create(userId: string, dto: CreateScheduleDto) {
    const course = await this.prisma.course.findFirst({
      where: {
        id: dto.courseId,
        userId,
        deletedAt: null,
      },
    });

    if (!course) {
      throw new BadRequestException({
        code: 'INVALID_COURSE',
        message: 'Mata kuliah tidak ditemukan atau tidak valid',
      });
    }

    return this.prisma.schedule.create({
      data: {
        courseId: dto.courseId,
        title: dto.title,
        type: dto.type,
        meetingNumber: dto.meetingNumber,
        dueDate: new Date(dto.dueDate),
        reminderMinutes: dto.reminderMinutes ?? 60,
        source: dto.source ?? 'MANUAL',
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

  async update(userId: string, id: string, dto: UpdateScheduleDto) {
    await this.findOne(userId, id);

    if (dto.courseId) {
      const course = await this.prisma.course.findFirst({
        where: {
          id: dto.courseId,
          userId,
          deletedAt: null,
        },
      });

      if (!course) {
        throw new BadRequestException({
          code: 'INVALID_COURSE',
          message: 'Mata kuliah tujuan tidak ditemukan atau tidak valid',
        });
      }
    }

    return this.prisma.schedule.update({
      where: { id },
      data: {
        ...(dto.courseId ? { courseId: dto.courseId } : {}),
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.type ? { type: dto.type } : {}),
        ...(dto.meetingNumber !== undefined ? { meetingNumber: dto.meetingNumber } : {}),
        ...(dto.dueDate ? { dueDate: new Date(dto.dueDate) } : {}),
        ...(dto.reminderMinutes !== undefined ? { reminderMinutes: dto.reminderMinutes } : {}),
        ...(dto.source ? { source: dto.source } : {}),
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

  async toggle(userId: string, id: string) {
    const schedule = await this.findOne(userId, id);

    return this.prisma.schedule.update({
      where: { id },
      data: {
        isCompleted: !schedule.isCompleted,
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

    await this.prisma.schedule.delete({
      where: { id },
    });

    return {
      message: 'Jadwal berhasil dihapus',
    };
  }
}
