import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { Public } from '../common/decorators/public.decorator.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login / Register via Firebase ID Token' })
  @ApiResponse({ status: 200, description: 'Login berhasil, mengembalikan profil user dan token' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
