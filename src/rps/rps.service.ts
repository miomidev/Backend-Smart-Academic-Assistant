import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ImportRpsDto } from './dto/import-rps.dto.js';
import { PDFParse } from 'pdf-parse';

export interface ParsedMeeting {
  meetingNumber: number;
  topic: string;
  activities: string[];
  hasTask: boolean;
  taskDescription: string | null;
  isExam: boolean;
  suggestedDate: string;
}

export interface ParsedRpsResult {
  courseName: string;
  courseCode: string | null;
  lecturer: string | null;
  semester: string | null;
  totalMeetings: number;
  meetings: ParsedMeeting[];
}

@Injectable()
export class RpsService {
  private readonly logger = new Logger(RpsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async parseRpsPdf(buffer: Buffer): Promise<ParsedRpsResult> {
    let fullText = '';
    try {
      const parser = new PDFParse({ data: buffer });
      const parseResult = await parser.getText();
      fullText = parseResult.text || '';
      await parser.destroy();
    } catch (err: any) {
      this.logger.error(`Gagal mengekstrak teks dari berkas PDF: ${err.message}`);
      throw new BadRequestException('Gagal memproses berkas PDF RPS. Pastikan berkas PDF valid dan tidak terenkripsi.');
    }

    if (!fullText.trim()) {
      throw new BadRequestException('Berkas PDF tidak mengandung teks yang dapat dibaca (kemungkinan berupa scan gambar murni).');
    }

    return this.extractRpsMetadata(fullText);
  }

  private extractRpsMetadata(text: string): ParsedRpsResult {
    // 1. Ekstraksi Nama Mata Kuliah
    const courseNameMatch =
      text.match(/(?:Nama\s+Mata\s+Kuliah|Mata\s+Kuliah|Nama\s+MK)\s*[:]\s*([^\n\r]+)/i) ||
      text.match(/RENCANA\s+PEMBELAJARAN\s+SEMESTER\s+(?:\([A-Z]+\)\s+)?([^\n\r]+)/i);
    const courseName = courseNameMatch ? courseNameMatch[1].trim() : 'Mata Kuliah Baru';

    // 2. Ekstraksi Kode Mata Kuliah
    const codeMatch = text.match(/(?:Kode\s+Mata\s+Kuliah|Kode\s+MK|Kode)\s*[:]\s*([A-Za-z0-9\-]+)/i);
    const courseCode = codeMatch ? codeMatch[1].trim() : null;

    // 3. Ekstraksi Dosen Pengampu
    const lecturerMatch = text.match(/(?:Dosen\s+Pengampu|Dosen|Pengampu)\s*[:]\s*([^\n\r]+)/i);
    const lecturer = lecturerMatch ? lecturerMatch[1].trim() : null;

    // 4. Ekstraksi Semester
    const semesterMatch = text.match(/(?:Semester)\s*[:]\s*([^\n\r]+)/i);
    const semester = semesterMatch ? semesterMatch[1].trim() : null;

    // 5. Ekstraksi Pertemuan Mingguan (1-16)
    const meetings: ParsedMeeting[] = [];
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

    // Hitung tanggal awal (Senin berikutnya pukul 08:00 WIB)
    const now = new Date();
    const dayOffset = (8 - (now.getUTCDay() || 7)) % 7 || 7;
    const baseDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    baseDate.setUTCHours(1, 0, 0, 0); // 01:00 UTC = 08:00 WIB

    for (let i = 1; i <= 16; i++) {
      const weekDate = new Date(baseDate.getTime() + (i - 1) * 7 * 24 * 60 * 60 * 1000);
      const isUts = i === 8;
      const isUas = i === 16;
      const isExam = isUts || isUas;

      // Cari baris yang merujuk pertemuan ini
      const pattern = new RegExp(`(?:Minggu|Pertemuan)\\s*(?:ke-?|\\s+)?0?${i}\\b`, 'i');
      const matchedLine = lines.find((l) => pattern.test(l));

      let topic = `Pertemuan ${i}: Materi Perkuliahan`;
      if (isUts) {
        topic = 'Ujian Tengah Semester (UTS)';
      } else if (isUas) {
        topic = 'Ujian Akhir Semester (UAS)';
      } else if (matchedLine) {
        const clean = matchedLine.replace(pattern, '').replace(/^[:\-\s]+/, '').trim();
        if (clean.length > 5) {
          topic = clean.slice(0, 100);
        }
      }

      const hasTask = !isExam && (i % 3 === 0 || /tugas|laporan|kuis|proyek/i.test(matchedLine || ''));
      const activities = isExam
        ? ['Ujian Tertulis']
        : ['Kuliah Tatap Muka', 'Diskusi Kelompok'];

      meetings.push({
        meetingNumber: i,
        topic,
        activities,
        hasTask,
        taskDescription: hasTask ? `Tugas Pertemuan ${i}` : null,
        isExam,
        suggestedDate: weekDate.toISOString(),
      });
    }

    return {
      courseName,
      courseCode,
      lecturer,
      semester,
      totalMeetings: meetings.length,
      meetings,
    };
  }

  async importRps(userId: string, dto: ImportRpsDto) {
    let targetCourseId = dto.courseId;
    let courseInfo: any = null;

    if (dto.createCourse && dto.courseData) {
      const { slots, startDate, ...rest } = dto.courseData;
      const created = await this.prisma.course.create({
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
      });
      targetCourseId = created.id;
      courseInfo = created;
    } else if (targetCourseId) {
      courseInfo = await this.prisma.course.findFirst({
        where: { id: targetCourseId, userId, deletedAt: null },
      });
      if (!courseInfo) {
        throw new BadRequestException({
          code: 'INVALID_COURSE',
          message: 'Mata kuliah yang dipilih tidak ditemukan',
        });
      }
    } else {
      throw new BadRequestException({
        code: 'MISSING_COURSE',
        message: 'courseId atau courseData harus disediakan untuk mengimpor jadwal RPS',
      });
    }

    // Buat jadwal secara massal
    const createdSchedules = await Promise.all(
      dto.schedules.map((item) =>
        this.prisma.schedule.create({
          data: {
            courseId: targetCourseId!,
            title: item.title,
            type: item.type,
            meetingNumber: item.meetingNumber,
            dueDate: new Date(item.dueDate),
            reminderMinutes: item.reminderMinutes ?? 60,
            source: 'RPS',
          },
        }),
      ),
    );

    return {
      course: {
        id: courseInfo.id,
        name: courseInfo.name,
        code: courseInfo.code,
      },
      importedSchedulesCount: createdSchedules.length,
      schedules: createdSchedules,
    };
  }
}
