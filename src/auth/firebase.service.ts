import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as fs from 'fs';

export interface DecodedAuthToken {
  uid: string;
  email: string;
  name?: string;
  picture?: string;
}

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp: App | null = null;
  private readonly isDevBypass: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isDevBypass = this.configService.get<string>('FIREBASE_DEV_BYPASS') === 'true';
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const existingApps = getApps();
      if (existingApps.length > 0) {
        this.firebaseApp = existingApps[0];
        return;
      }

      const serviceAccountPath = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');
      const serviceAccountJson = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT');

      if (serviceAccountJson) {
        const credentials = JSON.parse(serviceAccountJson);
        this.firebaseApp = initializeApp({
          credential: cert(credentials),
        });
        this.logger.log('Firebase Admin diinisialisasi dari FIREBASE_SERVICE_ACCOUNT env');
      } else if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        this.firebaseApp = initializeApp({
          credential: cert(serviceAccount),
        });
        this.logger.log(`Firebase Admin diinisialisasi dari berkas ${serviceAccountPath}`);
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        this.firebaseApp = initializeApp();
        this.logger.log('Firebase Admin diinisialisasi dari GOOGLE_APPLICATION_CREDENTIALS');
      } else {
        this.logger.warn('Kredensial Firebase tidak ditemukan. Mode Dev Bypass aktif untuk token pengembangan.');
      }
    } catch (err: any) {
      this.logger.warn(`Gagal menginisialisasi Firebase Admin: ${err.message}. Mode Dev Bypass aktif.`);
    }
  }

  async verifyToken(token: string): Promise<DecodedAuthToken> {
    // 1. Cek Dev Bypass untuk testing lokal & offline
    if (this.isDevBypass || !this.firebaseApp) {
      if (token === 'dev-token' || token.startsWith('dev-')) {
        return {
          uid: 'dev-firebase-uid-001',
          email: 'mahasiswa@unsil.ac.id',
          name: 'Tim Udah Pasti Menang',
          picture: null as any,
        };
      }

      if (token.startsWith('dev:')) {
        const email = token.substring(4);
        return {
          uid: `dev-uid-${Buffer.from(email).toString('hex').slice(0, 16)}`,
          email,
          name: email.split('@')[0],
          picture: null as any,
        };
      }
    }

    // 2. Verifikasi Token Firebase asli
    if (!this.firebaseApp) {
      throw new Error('Firebase Admin belum dikonfigurasi dan token bukan dev token yang valid');
    }

    const decoded = await getAuth(this.firebaseApp).verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email ?? `${decoded.uid}@firebase.user`,
      name: decoded.name,
      picture: decoded.picture,
    };
  }
}
