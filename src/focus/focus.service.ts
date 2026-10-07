import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RecordSessionDto } from './dto/record-session.dto.js';
import { QueryFocusSessionsDto } from './dto/query-focus-sessions.dto.js';

@Injectable()
export class FocusService {
  constructor(private readonly prisma: PrismaService) {}

  async recordSession(userId: string, dto: RecordSessionDto) {
    if (dto.scheduleId) {
      const schedule = await this.prisma.schedule.findFirst({
        where: {
          id: dto.scheduleId,
          course: {
            userId,
            deletedAt: null,
          },
        },
      });

      if (!schedule) {
        throw new BadRequestException({
          code: 'INVALID_SCHEDULE',
          message: 'Jadwal yang dikaitkan tidak ditemukan atau tidak valid',
        });
      }
    }

    return this.prisma.focusSession.upsert({
      where: { id: dto.id },
      update: {
        scheduleId: dto.scheduleId || undefined,
        plannedSeconds: dto.plannedSeconds,
        actualSeconds: dto.actualSeconds,
        status: dto.status,
        failReason: dto.failReason || undefined,
        startedAt: new Date(dto.startedAt),
        endedAt: new Date(dto.endedAt),
      },
      create: {
        id: dto.id,
        userId,
        scheduleId: dto.scheduleId || null,
        plannedSeconds: dto.plannedSeconds,
        actualSeconds: dto.actualSeconds,
        status: dto.status,
        failReason: dto.failReason || null,
        startedAt: new Date(dto.startedAt),
        endedAt: new Date(dto.endedAt),
      },
      include: {
        schedule: {
          select: {
            id: true,
            title: true,
            type: true,
            course: {
              select: {
                id: true,
                name: true,
                colorCode: true,
              },
            },
          },
        },
      },
    });
  }

  async getStats(userId: string, period: 'today' | 'week' | 'month' | 'all' = 'today') {
    const now = new Date();
    let startDate: Date | undefined;

    if (period === 'today') {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      startDate = startOfDay;
    } else if (period === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);
      startOfWeek.setHours(0, 0, 0, 0);
      startDate = startOfWeek;
    } else if (period === 'month') {
      const startOfMonth = new Date(now);
      startOfMonth.setDate(now.getDate() - 30);
      startOfMonth.setHours(0, 0, 0, 0);
      startDate = startOfMonth;
    }

    const sessions = await this.prisma.focusSession.findMany({
      where: {
        userId,
        ...(startDate ? { startedAt: { gte: startDate } } : {}),
      },
      orderBy: {
        startedAt: 'asc',
      },
    });

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.status === 'COMPLETED').length;
    const failedSessions = sessions.filter((s) => s.status === 'FAILED').length;
    const successRate = totalSessions > 0 ? parseFloat((completedSessions / totalSessions).toFixed(2)) : 0;
    const totalFocusSeconds = sessions.reduce((acc, s) => acc + s.actualSeconds, 0);
    const totalFocusMinutes = Math.round(totalFocusSeconds / 60);

    // Hitung breakdown harian
    const breakdownMap = new Map<string, { focusMinutes: number; completedSessions: number }>();

    for (const session of sessions) {
      const dateStr = session.startedAt.toISOString().split('T')[0];
      const existing = breakdownMap.get(dateStr) || { focusMinutes: 0, completedSessions: 0 };

      existing.focusMinutes += Math.round(session.actualSeconds / 60);
      if (session.status === 'COMPLETED') {
        existing.completedSessions += 1;
      }
      breakdownMap.set(dateStr, existing);
    }

    const dailyBreakdown = Array.from(breakdownMap.entries()).map(([date, data]) => ({
      date,
      focusMinutes: data.focusMinutes,
      completedSessions: data.completedSessions,
    }));

    return {
      totalSessions,
      completedSessions,
      failedSessions,
      successRate,
      totalFocusSeconds,
      totalFocusMinutes,
      dailyBreakdown,
    };
  }

  async findAll(userId: string, query: QueryFocusSessionsDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.focusSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          startedAt: 'desc',
        },
        include: {
          schedule: {
            select: {
              id: true,
              title: true,
              type: true,
              course: {
                select: {
                  id: true,
                  name: true,
                  colorCode: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.focusSession.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
