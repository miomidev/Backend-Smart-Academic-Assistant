import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { FirebaseService } from './firebase.service.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async login(dto: LoginDto) {
    const decoded = await this.firebaseService.verifyToken(dto.idToken);

    const user = await this.prisma.user.upsert({
      where: { firebaseUid: decoded.uid },
      update: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.university ? { university: dto.university } : {}),
        ...(decoded.picture ? { photoUrl: decoded.picture } : {}),
      },
      create: {
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: dto.name || decoded.name || 'Tim Udah Pasti Menang',
        photoUrl: decoded.picture || null,
        university: dto.university || 'Universitas Siliwangi',
        timezone: 'Asia/Jakarta',
      },
    });

    return {
      token: dto.idToken,
      user,
    };
  }
}
