import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { FirebaseService } from '../../auth/firebase.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly firebaseService: FirebaseService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Token otentikasi tidak ditemukan atau format salah',
      });
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Token otentikasi kosong',
      });
    }

    try {
      const decoded = await this.firebaseService.verifyToken(token);

      let user = await this.prisma.user.findUnique({
        where: { firebaseUid: decoded.uid },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            firebaseUid: decoded.uid,
            email: decoded.email,
            name: decoded.name || 'Tim Udah Pasti Menang',
            photoUrl: decoded.picture || null,
            university: 'Universitas Siliwangi',
            timezone: 'Asia/Jakarta',
          },
        });
      }

      request.user = user;
      return true;
    } catch (error: any) {
      throw new UnauthorizedException({
        code: 'INVALID_TOKEN',
        message: 'Token otentikasi tidak valid atau telah kedaluwarsa',
        details: error?.message,
      });
    }
  }
}
