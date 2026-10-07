import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { QueryCourseDto } from './dto/query-course.dto.js';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: QueryCourseDto) {
    return this.prisma.course.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        slots: query.includeSlots ? true : false,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(userId: string, id: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      include: {
        slots: true,
      },
    });

    if (!course) {
      throw new NotFoundException({
        code: 'COURSE_NOT_FOUND',
        message: 'Mata kuliah tidak ditemukan',
      });
    }

    return course;
  }

  async create(userId: string, dto: CreateCourseDto) {
    const { slots, startDate, ...rest } = dto;

    return this.prisma.course.create({
      data: {
        ...rest,
        userId,
        startDate: startDate ? new Date(startDate) : null,
        slots:
          slots && slots.length > 0
            ? {
                create: slots.map((s) => ({
                  dayOfWeek: s.dayOfWeek,
                  startTime: s.startTime,
                  endTime: s.endTime,
                  room: s.room,
                })),
              }
            : undefined,
      },
      include: {
        slots: true,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateCourseDto) {
    await this.findOne(userId, id);

    const { slots, startDate, ...rest } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (slots !== undefined) {
        await tx.courseSlot.deleteMany({
          where: { courseId: id },
        });

        if (slots.length > 0) {
          await tx.courseSlot.createMany({
            data: slots.map((s) => ({
              courseId: id,
              dayOfWeek: s.dayOfWeek,
              startTime: s.startTime,
              endTime: s.endTime,
              room: s.room,
            })),
          });
        }
      }

      return tx.course.update({
        where: { id },
        data: {
          ...rest,
          ...(startDate !== undefined
            ? { startDate: startDate ? new Date(startDate) : null }
            : {}),
        },
        include: {
          slots: true,
        },
      });
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    await this.prisma.course.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      message: 'Mata kuliah berhasil dihapus',
    };
  }
}
