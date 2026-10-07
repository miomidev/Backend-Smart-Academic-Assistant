import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface AutoTagResult {
  suggestedCourseId: string | null;
  confidenceScore: number | null;
  reasons: string[];
  course?: {
    id: string;
    name: string;
    code: string | null;
    colorCode: string;
  } | null;
}

@Injectable()
export class AutoTagService {
  constructor(private readonly prisma: PrismaService) {}

  private parseTimeToMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10));
    return h * 60 + m;
  }

  private getJakartaDayAndMinutes(
    date: Date,
    timezone: string = 'Asia/Jakarta',
  ): { dayOfWeek: number; currentMinutes: number } {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      });

      const parts = formatter.formatToParts(date);
      const weekdayStr = parts.find((p) => p.type === 'weekday')?.value || 'Mon';
      const hourStr = parts.find((p) => p.type === 'hour')?.value || '0';
      const minuteStr = parts.find((p) => p.type === 'minute')?.value || '0';

      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      const daysMap: Record<string, number> = {
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
        Sun: 7,
      };

      const dayOfWeek = daysMap[weekdayStr] || 1;
      const currentMinutes = (hour === 24 ? 0 : hour) * 60 + minute;

      return { dayOfWeek, currentMinutes };
    } catch {
      // Fallback ke UTC jika timezone invalid
      const day = date.getUTCDay();
      const dayOfWeek = day === 0 ? 7 : day;
      const currentMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
      return { dayOfWeek, currentMinutes };
    }
  }

  async detectCourse(
    userId: string,
    title?: string,
    content?: string,
    recordedAt?: Date,
  ): Promise<AutoTagResult> {
    const courses = await this.prisma.course.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        slots: true,
      },
    });

    if (!courses || courses.length === 0) {
      return {
        suggestedCourseId: null,
        confidenceScore: null,
        reasons: [],
        course: null,
      };
    }

    const targetDate = recordedAt || new Date();
    const { dayOfWeek, currentMinutes } = this.getJakartaDayAndMinutes(targetDate);
    const combinedText = `${title || ''} ${content || ''}`.toLowerCase();

    let bestScore = 0;
    let bestCourse: (typeof courses)[0] | null = null;
    let bestReasons: string[] = [];

    const dayNames = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    for (const course of courses) {
      let score = 0;
      const reasons: string[] = [];

      // 1. Cek kecocokan Slot Jadwal (Bobot 0.50)
      if (course.slots && course.slots.length > 0) {
        for (const slot of course.slots) {
          if (slot.dayOfWeek === dayOfWeek) {
            const startMin = this.parseTimeToMinutes(slot.startTime);
            const endMin = this.parseTimeToMinutes(slot.endTime);

            // Toleransi 15 menit sebelum dan sesudah jadwal perkuliahan
            if (currentMinutes >= startMin - 15 && currentMinutes <= endMin + 15) {
              score += 0.5;
              reasons.push(
                `Sesuai jadwal kuliah ${course.name} (${dayNames[slot.dayOfWeek]} ${slot.startTime} - ${slot.endTime})`,
              );
              break;
            }
          }
        }
      }

      // 2. Cek kecocokan Keywords (Bobot up to 0.40)
      if (course.keywords && course.keywords.length > 0) {
        const matchedKeywords: string[] = [];
        for (const kw of course.keywords) {
          const cleanKw = kw.trim().toLowerCase();
          if (cleanKw && combinedText.includes(cleanKw)) {
            matchedKeywords.push(kw);
          }
        }

        if (matchedKeywords.length > 0) {
          const keywordScore = Math.min(0.4, matchedKeywords.length * 0.15);
          score += keywordScore;
          reasons.push(
            `Ditemukan ${matchedKeywords.length} kata kunci: ${matchedKeywords.join(', ')}`,
          );
        }
      }

      // 3. Cek Nama Mata Kuliah / Kode (Bobot 0.30)
      const courseNameLower = course.name.toLowerCase();
      const codeLower = course.code ? course.code.toLowerCase() : null;

      if (combinedText.includes(courseNameLower)) {
        score += 0.3;
        reasons.push(`Nama mata kuliah terdeteksi dalam teks: "${course.name}"`);
      } else if (codeLower && combinedText.includes(codeLower)) {
        score += 0.3;
        reasons.push(`Kode mata kuliah terdeteksi dalam teks: "${course.code}"`);
      }

      const totalScore = Math.min(1.0, score);
      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestCourse = course;
        bestReasons = reasons;
      }
    }

    // Ambang batas kepercayaan minimal 0.30
    if (bestCourse && bestScore >= 0.3) {
      return {
        suggestedCourseId: bestCourse.id,
        confidenceScore: parseFloat(bestScore.toFixed(2)),
        reasons: bestReasons,
        course: {
          id: bestCourse.id,
          name: bestCourse.name,
          code: bestCourse.code,
          colorCode: bestCourse.colorCode,
        },
      };
    }

    return {
      suggestedCourseId: null,
      confidenceScore: null,
      reasons: [],
      course: null,
    };
  }
}
