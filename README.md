# 🎓 Smart Academic Assistant (SAA) - Backend API

> **Backend RESTful API untuk Aplikasi Mobile "Smart Academic Assistant"**  
> Karya Inovasi Kategori Pendidikan — **IconFest Universitas Siliwangi (UNSIL)**

[![NestJS](https://img.shields.io/badge/Framework-NestJS%20v11-ea2849?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/ORM-Prisma%20v6-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)](https://www.postgresql.org/)
[![Swagger](https://img.shields.io/badge/API%20Docs-Swagger%20OpenAPI%203-85EA2D?logo=swagger)](http://localhost:3000/api/docs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Gambaran Umum

**Smart Academic Assistant (SAA)** adalah asisten akademik cerdas berbasis mobile-first yang dirancang untuk mengatasi fenomena *academic overload* di kalangan mahasiswa. Backend ini dibangun menggunakan arsitektur **NestJS (TypeScript)** modular, andal, dan siap mendukung sinkronisasi *offline-first*.

### 🌟 Fitur Utama Backend:
1. **Multi-Factor Heuristic Auto-Tagging:**
   - Deteksi otomatis mata kuliah untuk catatan dan rekaman audio berdasarkan:
     - 🕒 **Slot Jadwal Mingguan:** Pencocokan hari dan jam kuliah (toleransi $\pm 15$ menit) dengan zona waktu `Asia/Jakarta` (Bobot: 0.50).
     - 🏷️ **Kata Kunci Spesifik:** Pencocokan topik perkuliahan (Bobot: hingga 0.40).
     - 📚 **Nama & Kode Matkul:** Pencocokan teks nama mata kuliah (Bobot: 0.30).
2. **Ekstraksi Silabus RPS (Rencana Pembelajaran Semester):**
   - Parser PDF dokumen RPS yang secara otomatis mengekstrak 16 pertemuan kuliah dan menghasilkan agenda jadwal perkuliahan massal (*bulk import*).
3. **Pomodoro Focus Session & Analytics:**
   - Pencatatan durasi fokus dengan dukungan mitigasi distraksi.
   - Analitik performa fokus harian, mingguan, bulanan, serta tingkat keberhasilan (*success rate*).
4. **Offline-First & Idempotent Architecture:**
   - Mendukung pembuatan UUID v4 di sisi klien untuk catatan dan sesi fokus agar tidak terjadi duplikasi saat sinkronisasi ulang (*network retry*).
5. **Autentikasi Aman & Dev Bypass Mode:**
   - Integrasi Firebase Admin SDK untuk verifikasi ID token.
   - Dukungan *Development Bypass Mode* (`dev-token`) untuk mempermudah pengujian tim frontend.
6. **Standardized Responses:**
   - Format respons konsisten berbasis spesifikasi **JSend** (`status: 'success'` dan `status: 'error'`).

---

## 🏗️ Arsitektur & Teknologi

| Komponen | Teknologi |
|---|---|
| **Runtime & Framework** | Node.js (ESM), NestJS 11 |
| **Bahasa Pemrograman** | TypeScript 5 |
| **Database & ORM** | PostgreSQL, Prisma ORM v6 |
| **Autentikasi** | Firebase Authentication & Firebase Admin SDK |
| **Dokumentasi API** | Swagger / OpenAPI 3.0 |
| **Validasi Data** | `class-validator`, `class-transformer` |
| **Keamanan** | Helmet, CORS, Throttler / Rate Limiting |
| **PDF Processing** | `pdf-parse` v2 |

---

## 📋 Daftar Endpoint API (`/api/v1`)

Dokumentasi interaktif dapat diakses melalui Swagger UI di:  
👉 **`http://localhost:3000/api/docs`**

### 1. Health
- `GET /api/v1/health` — Status server dan konektivitas database PostgreSQL.

### 2. Autentikasi (`/api/v1/auth`)
- `POST /api/v1/auth/login` — Verifikasi Firebase ID token & auto-upsert pengguna.

### 3. Profil Pengguna (`/api/v1/me`)
- `GET /api/v1/me` — Ambil data profil mahasiswa yang sedang aktif.
- `PATCH /api/v1/me` — Perbarui nama, universitas, atau preferensi zona waktu.

### 4. Manajemen Mata Kuliah (`/api/v1/courses`)
- `GET /api/v1/courses` — Daftar mata kuliah mahasiswa (filter semester, include slots).
- `POST /api/v1/courses` — Tambah mata kuliah, kata kunci auto-tag, dan slot jadwal mingguan.
- `GET /api/v1/courses/:id` — Detail mata kuliah dan riwayat slot.
- `PUT /api/v1/courses/:id` — Perbarui informasi mata kuliah.
- `DELETE /api/v1/courses/:id` — Hapus mata kuliah (*soft-delete*).

### 5. Jadwal & Agenda Akademik (`/api/v1/schedules`)
- `GET /api/v1/schedules` — Daftar agenda/tugas/ujian dengan filter rentang tanggal (`startDate`, `endDate`).
- `POST /api/v1/schedules` — Tambah agenda perkuliahan / tenggat tugas.
- `GET /api/v1/schedules/:id` — Detail agenda.
- `PUT /api/v1/schedules/:id` — Perbarui agenda.
- `PATCH /api/v1/schedules/:id/toggle` — Tandai selesai / belum selesai (*checkbox task*).
- `DELETE /api/v1/schedules/:id` — Hapus agenda.

### 6. Catatan & Transkrip Suara (`/api/v1/notes`)
- `GET /api/v1/notes` — Daftar catatan dengan pencarian kata kunci dan filter tipe (`VOICE` / `DOCUMENT`).
- `POST /api/v1/notes` — Simpan catatan / transkrip baru (idempoten dengan UUID dari client).
- `POST /api/v1/notes/upload` — Unggah berkas audio rekaman (`.m4a`, `.mp3`, `.wav`) atau dokumen.
- `POST /api/v1/notes/auto-tag/preview` — Pratinjau kalkulasi kecocokan auto-tagging sebelum disimpan.
- `POST /api/v1/notes/:id/confirm-tag` — Konfirmasi pilihan mata kuliah untuk catatan.
- `GET /api/v1/notes/:id` — Detail catatan.
- `PUT /api/v1/notes/:id` — Perbarui catatan.
- `DELETE /api/v1/notes/:id` — Hapus catatan (*soft-delete*).

### 7. Sesi Fokus & Pomodoro (`/api/v1/focus`)
- `POST /api/v1/focus/sessions` — Rekam sesi fokus Pomodoro yang telah selesai / gagal (idempoten UUID).
- `GET /api/v1/focus/stats` — Analitik durasi fokus dan rasio keberhasilan (`today`, `week`, `month`, `all`).
- `GET /api/v1/focus/sessions` — Riwayat sesi fokus dengan pagination.

### 8. RPS Syllabus Extraction (`/api/v1/rps`)
- `POST /api/v1/rps/parse` — Ekstraksi silabus RPS dari berkas PDF (pratinjau 16 pertemuan).
- `POST /api/v1/rps/import` — Impor massal hasil silabus RPS menjadi jadwal perkuliahan.

---

## 🚀 Panduan Memulai (Quick Start)

### Prasyarat
- **Node.js** >= 20.x
- **PostgreSQL** >= 14.x
- **NPM** atau **PNPM**

### 1. Kloning Repositori
```bash
git clone https://github.com/miomidev/Backend-Smart-Academic-Assistant.git
cd Backend-Smart-Academic-Assistant
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan konfigurasi koneksi database:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/saa?schema=public"
PORT=3000
NODE_ENV=development
DEFAULT_TIMEZONE=Asia/Jakarta
FIREBASE_DEV_BYPASS=true
```

### 4. Sinkronisasi Skema Database
```bash
npx prisma db push
```

### 5. Menjalankan Server
```bash
# Mode pengembangan dengan auto-reload:
npm run start:dev

# Mode produksi:
npm run build
npm run start:prod
```

Server akan aktif di:  
🌐 API URL: `http://localhost:3000/api/v1`  
📖 Swagger Docs: `http://localhost:3000/api/docs`

---

## 🧪 Panduan Testing Cepat (Dev Bypass)
Gunakan header berikut pada setiap HTTP request untuk melewati autentikasi Firebase secara lokal:
```http
Authorization: Bearer dev-token
```
Pengguna otomatis (*dummy dev user*) akan dibuat di database lokal:
- **Nama:** Mahasiswa UNSIL Dev
- **Email:** `mahasiswa@unsil.ac.id`
- **Universitas:** Universitas Siliwangi

---

## 👨‍💻 Kontributor
- **Tim Pengembang Smart Academic Assistant**
- Universitas Siliwangi (UNSIL) - IconFest 2026


When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Observability

In production applications, observability is essential for understanding how your system behaves, detecting issues early, and maintaining reliable performance.

[NestJS Observe](https://observe.nestjs.com) automatically instruments your NestJS application, giving you deep visibility into your system with minimal setup:

- **Distributed tracing:** Follow requests across services and understand how they flow through your system.
- **Waterfall analysis:** Visualize request execution and identify slow operations, bottlenecks, and unexpected delays.
- **Performance analysis:** Analyze application performance in real time and quickly pinpoint areas that need optimization.
- **Metrics:** Track key application and infrastructure metrics to understand system health and performance trends.
- **Logging:** Centralize and correlate logs with traces and other telemetry to make debugging easier.
- **Error tracking:** Detect errors quickly and investigate their root causes with the surrounding context.
- **SLA monitoring:** Track service-level objectives and identify when your application is approaching or exceeding defined thresholds.
- **Alarms and alerts:** Set up alerts for critical errors, performance degradation, SLA violations, and other anomalies so your team can react quickly.

To add it to this project:

```bash
$ npm install @nestjs/observe
```

Then follow the [setup guide](https://docs.nestjs.com/observability/overview) - it takes a single import and an app key.

The free plan needs no payment details and covers 300,000 events a month. You can also browse the [live demo](https://www.observe-demo.nestjs.com/dashboard) first - the whole dashboard over a busy service's data, with nothing to install.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Auto-instrument your application with [NestJS Observe](https://observe.nestjs.com). Distributed tracing, metrics, and logging made easy. Error tracking and performance monitoring for your NestJS applications.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
