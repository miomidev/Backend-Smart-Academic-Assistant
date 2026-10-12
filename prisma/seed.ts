import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding database Smart Academic Assistant...');

  // 1. Bersihkan data lama dengan urutan cascade yang aman
  await prisma.focusSession.deleteMany();
  await prisma.note.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.courseSlot.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // 2. Buat User Mahasiswa yang cocok dengan mode dev bypass backend (token 'dev-token')
  const user = await prisma.user.create({
    data: {
      firebaseUid: 'dev-firebase-uid-001',
      email: 'mahasiswa@unsil.ac.id',
      name: 'Mahasiswa UNSIL Dev',
      university: 'Universitas Siliwangi',
      timezone: 'Asia/Jakarta',
    },
  });

  console.log(`✅ User berhasil dibuat: ${user.name} (${user.email})`);

  // 3. Buat 3 Mata Kuliah dengan palet warna dan slot jadwal mingguan
  const now = new Date();
  const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // 1 = Senin ... 7 = Minggu

  const courseWeb = await prisma.course.create({
    data: {
      userId: user.id,
      name: 'Pemrograman Web',
      code: 'IF2101',
      lecturer: 'Husni Mubarok, S.T., M.T.',
      colorCode: '#4F46E5', // Indigo
      keywords: ['html', 'css', 'javascript', 'react', 'api', 'backend', 'frontend'],
      slots: {
        create: [
          {
            dayOfWeek: currentDayOfWeek, // Jadwal hari ini agar langsung muncul di Beranda!
            startTime: '08:00',
            endTime: '10:30',
            room: 'Lab Jaringan & Web',
          },
        ],
      },
    },
  });

  const courseData = await prisma.course.create({
    data: {
      userId: user.id,
      name: 'Struktur Data & Algoritma',
      code: 'IF2102',
      lecturer: 'Ardi Mardiana, S.T., M.Kom.',
      colorCode: '#0EA5E9', // Sky Blue
      keywords: ['array', 'stack', 'queue', 'tree', 'graph', 'linked list', 'sorting'],
      slots: {
        create: [
          {
            dayOfWeek: (currentDayOfWeek % 7) + 1,
            startTime: '13:00',
            endTime: '15:30',
            room: 'Ruang Teori D-204',
          },
        ],
      },
    },
  });

  const courseRPL = await prisma.course.create({
    data: {
      userId: user.id,
      name: 'Rekayasa Perangkat Lunak',
      code: 'IF2103',
      lecturer: 'Dr. Rahmawati, M.T.',
      colorCode: '#8B5CF6', // Purple
      keywords: ['uml', 'scrum', 'agile', 'requirement', 'testing', 'sdlc', 'sprint'],
      slots: {
        create: [
          {
            dayOfWeek: 4, // Kamis
            startTime: '10:00',
            endTime: '12:30',
            room: 'Gedung Rektorat Lt. 3',
          },
        ],
      },
    },
  });

  const courseAI = await prisma.course.create({
    data: {
      userId: user.id,
      name: 'Kecerdasan Artifisial',
      code: 'IF3101',
      lecturer: 'Prof. Bambang Prasetyo, Ph.D.',
      colorCode: '#EF5350', // Red/Pink
      keywords: ['ai', 'fuzzy', 'neural network', 'search', 'heuristic'],
      slots: {
        create: [
          {
            dayOfWeek: 2, // Selasa
            startTime: '08:00',
            endTime: '10:30',
            room: 'Lab Komputasi C-101',
          },
        ],
      },
    },
  });

  const courseGrafika = await prisma.course.create({
    data: {
      userId: user.id,
      name: 'Grafika Komputer',
      code: 'IF3102',
      lecturer: 'Dian Nugraha, M.Kom.',
      colorCode: '#4CAF50', // Green
      keywords: ['opengl', 'shader', '3d', 'rendering', 'vector'],
      slots: {
        create: [
          {
            dayOfWeek: 3, // Rabu
            startTime: '10:00',
            endTime: '12:30',
            room: 'Lab Grafika B-201',
          },
        ],
      },
    },
  });

  const courseDB = await prisma.course.create({
    data: {
      userId: user.id,
      name: 'Basis Data',
      code: 'IF2104',
      lecturer: 'Siti Nurhaliza, M.T.',
      colorCode: '#2196F3', // Blue
      keywords: ['sql', 'query', 'normalisasi', 'rdbms', 'erd'],
      slots: {
        create: [
          {
            dayOfWeek: 4, // Kamis
            startTime: '13:00',
            endTime: '15:30',
            room: 'Lab Basis Data D-102',
          },
        ],
      },
    },
  });

  const courseStrukdat = await prisma.course.create({
    data: {
      userId: user.id,
      name: 'Struktur Data',
      code: 'IF2102',
      lecturer: 'Ardi Mardiana, S.T., M.Kom.',
      colorCode: '#757575', // Grey
      keywords: ['linked list', 'stack', 'queue', 'tree', 'graph'],
      slots: {
        create: [
          {
            dayOfWeek: 5, // Jumat
            startTime: '08:00',
            endTime: '10:30',
            room: 'Ruang Teori D-204',
          },
        ],
      },
    },
  });

  console.log('✅ Mata kuliah & slot kelas berhasil dibuat.');

  // 4. Buat Jadwal Kuliah Hari Ini & Tugas Mendatang
  // A. Jadwal Kelas Hari Ini (jam 08:00 WIB hari ini)
  const todayClassDate = new Date();
  todayClassDate.setHours(8, 0, 0, 0);

  await prisma.schedule.create({
    data: {
      courseId: courseWeb.id,
      title: 'Pertemuan 5: Integrasi REST API & State Management',
      type: 'CLASS',
      meetingNumber: 5,
      dueDate: todayClassDate,
      isCompleted: false,
      source: 'RPS',
    },
  });

  // B. Tugas Hari Ini & Besok untuk Kecerdasan Artifisial (sesuai Tugas.svg)
  const taskTodayDate = new Date();
  taskTodayDate.setHours(23, 59, 0, 0);

  const taskTomorrowDate = new Date();
  taskTomorrowDate.setDate(taskTomorrowDate.getDate() + 1);
  taskTomorrowDate.setHours(23, 59, 0, 0);

  await prisma.schedule.create({
    data: {
      courseId: courseAI.id,
      title: 'Praktikum 4',
      type: 'TASK',
      meetingNumber: 4,
      dueDate: taskTomorrowDate,
      isCompleted: false,
      reminderMinutes: 60,
      source: 'MANUAL',
    },
  });

  await prisma.schedule.create({
    data: {
      courseId: courseAI.id,
      title: 'Praktikum 4 (Lanjutan Analisis)',
      type: 'TASK',
      meetingNumber: 4,
      dueDate: taskTomorrowDate,
      isCompleted: false,
      reminderMinutes: 60,
      source: 'MANUAL',
    },
  });

  await prisma.schedule.create({
    data: {
      courseId: courseAI.id,
      title: 'Praktikum 3: Evaluasi Rule Base',
      type: 'TASK',
      meetingNumber: 3,
      dueDate: taskTodayDate,
      isCompleted: false,
      reminderMinutes: 60,
      source: 'MANUAL',
    },
  });

  // C. Tugas Mendatang
  const task1Date = new Date();
  task1Date.setDate(task1Date.getDate() + 3);
  task1Date.setHours(23, 59, 0, 0);

  await prisma.schedule.create({
    data: {
      courseId: courseStrukdat.id,
      title: 'Implementasi Binary Search Tree pada Kasus Nyata',
      type: 'TASK',
      dueDate: task1Date,
      isCompleted: false,
      reminderMinutes: 120,
      source: 'MANUAL',
    },
  });

  const task2Date = new Date();
  task2Date.setDate(task2Date.getDate() + 5);
  task2Date.setHours(17, 0, 0, 0);

  await prisma.schedule.create({
    data: {
      courseId: courseRPL.id,
      title: 'Pembuatan Dokumen SRS & Use Case Diagram',
      type: 'TASK',
      dueDate: task2Date,
      isCompleted: false,
      reminderMinutes: 60,
      source: 'MANUAL',
    },
  });

  console.log('✅ Jadwal hari ini & daftar tugas sesuai Tugas.svg berhasil dibuat.');

  // 5. Buat Catatan Kuliah Contoh (Note) sesuai Mockup Catatan(Filled).svg
  // A. Standalone Note 1: Fuzzy Input (gambar WhatsApp)
  await prisma.note.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      title: 'Fuzzy Input',
      content:
        'Studi kasus untuk Fuzzy Logic: Estimasi Jarak Tempuh Kendaraan.\nInput 1: Pemakaian bensin (liter)\nSedikit: 0-5 liter, Sedang: 3-10 liter, Banyak: 8-15 liter.\nInput 2: Durasi Perjalanan (jam)\nSingkat: 0-2 jam, Sedang: 1-5 jam, Lama: 4-8 jam.\nOutput Estimasi Jarak Tempuh (km)\nDekat: 0-50 km, Sedang: 30-150 km, Jauh: 100-300 km.\nGunakan untuk defuzzifikasi dengan 3 metode untuk studi kasus kondisi kendaraan 6 liter bensin dan durasi perjalanan 3 jam.',
      type: 'DOCUMENT',
      suggestedCourseId: courseAI.id,
    },
  });

  // B. Standalone Note 2: Diskusi Iconfest & PlayIT (voice note 73 menit)
  await prisma.note.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      title: 'Diskusi Iconfest & PlayIT',
      content:
        'Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation.',
      type: 'VOICE',
      durationSeconds: 73 * 60, // 73 menit
      language: 'id-ID',
      confidenceScore: 0.95,
    },
  });

  // C. Catatan Kecerdasan Artifisial
  await prisma.note.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      courseId: courseAI.id,
      title: 'Algoritma Fuzzy',
      content:
        'Fuzzy logic handles the concept of partial truth. Nilai kebenaran berkisar antara 0 dan 1. Logika fuzzy cocok untuk sistem kontrol yang ambigu seperti mesin cuci pintar dan AC adaptif.',
      type: 'VOICE',
      durationSeconds: 180,
      language: 'id-ID',
    },
  });

  await prisma.note.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      courseId: courseAI.id,
      title: 'Algoritma Pencarian',
      content:
        'Materi perbandingan strategi Uninformed Search (BFS, DFS) dan Informed Search (Greedy Best-First, A*). Heuristik harus admissible dan consistent agar solusi optimal terjamin.',
      type: 'DOCUMENT',
    },
  });

  await prisma.note.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      courseId: courseAI.id,
      title: 'Pengantar Kecerdasan Artifisial',
      content:
        'Pengenalan agen cerdas (PEAS: Performance measure, Environment, Actuators, Sensors). Macam-macam lingkungan agen: fully observable vs partially observable, deterministik vs stokastik.',
      type: 'DOCUMENT',
    },
  });

  // D. Catatan Basis Data
  await prisma.note.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      courseId: courseDB.id,
      title: 'SQL Query',
      content:
        'Optimalisasi query SQL dengan INDEX, JOIN, subquery, serta penggunaan window functions seperti ROW_NUMBER() dan RANK() untuk pelaporan analitik.',
      type: 'DOCUMENT',
    },
  });

  await prisma.note.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      courseId: courseDB.id,
      title: 'Normalisasi',
      content:
        'Langkah-langkah normalisasi basis data relasional: 1NF (nilai atomik), 2NF (hilangkan ketergantungan parsial), 3NF (hilangkan ketergantungan transitif), hingga BCNF.',
      type: 'DOCUMENT',
    },
  });

  // E. Catatan Struktur Data
  await prisma.note.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      courseId: courseStrukdat.id,
      title: 'Linked List',
      content:
        'Perbedaan Singly Linked List dan Doubly Linked List dalam hal traversal dan memori overhead. Operasi insert, delete, dan search memiliki kompleksitas waktu O(1) untuk head dan O(n) untuk pencarian elemen sembarang.',
      type: 'DOCUMENT',
    },
  });

  await prisma.note.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      courseId: courseStrukdat.id,
      title: 'Stack & Queue',
      content:
        'Struktur data Stack menganut prinsip LIFO (Last In First Out) yang sering digunakan pada undo-redo dan call stack rekursi. Queue menganut prinsip FIFO (First In First Out) untuk antrian proses printer dan message broker.',
      type: 'DOCUMENT',
    },
  });

  // F. Catatan Pemrograman Web
  await prisma.note.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      courseId: courseWeb.id,
      title: 'Catatan Pertemuan 4: REST API Architecture',
      content:
        'Dosen menjelaskan perbedaan antara GET, POST, PUT, DELETE, dan PATCH. Best practice endpoint harus menggunakan kata benda jamak, contoh: /api/v1/courses. Respon error wajib menggunakan HTTP status code yang representatif.',
      type: 'VOICE',
      language: 'id-ID',
      durationSeconds: 145,
      confidenceScore: 0.92,
      suggestedCourseId: courseWeb.id,
    },
  });

  console.log('✅ Catatan lengkap sesuai mockup berhasil dibuat.');

  // 6. Buat Riwayat Sesi Fokus (Focus Session)
  const sessionStart = new Date(Date.now() - 3600 * 1000);
  const sessionEnd = new Date(sessionStart.getTime() + 25 * 60 * 1000);

  await prisma.focusSession.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      plannedSeconds: 1500, // 25 menit
      actualSeconds: 1500,
      status: 'COMPLETED',
      startedAt: sessionStart,
      endedAt: sessionEnd,
    },
  });

  console.log('✅ Riwayat sesi fokus berhasil dibuat.');
  console.log('🎉 Seeding database SAA selesai dengan sukses 100%!');
}

main()
  .catch((e) => {
    console.error('Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
