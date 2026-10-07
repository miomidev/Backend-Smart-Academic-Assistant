import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('User')
@ApiBearerAuth()
@Controller('me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil profil pengguna saat ini' })
  @ApiResponse({ status: 200, description: 'Profil pengguna berhasil diambil' })
  async getProfile(@CurrentUser() user: AuthUser) {
    return this.usersService.getProfile(user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Perbarui profil pengguna saat ini' })
  @ApiResponse({ status: 200, description: 'Profil pengguna berhasil diperbarui' })
  async updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }
}
