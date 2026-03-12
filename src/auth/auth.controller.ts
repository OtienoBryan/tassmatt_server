import { Controller, Post, Body, Get, Headers, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { LoginDto } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  async login(@Body() loginDto: LoginDto) {
    try {
      console.log('Login attempt:', { email: loginDto.email });
      const result = await this.authService.login(loginDto);
      console.log('Login successful:', { email: result.staff.email, role: result.staff.role });
      return {
        token: result.token,
        staff: result.staff,
        user: result.staff, // Also include 'user' for backward compatibility
      };
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      throw error;
    }
  }

  @Get('admin/me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '') || '';
    const staff = await this.authService.validateToken(token);
    
    if (!staff) {
      throw new Error('Invalid token');
    }

    return {
      id: staff.id,
      email: staff.email,
      firstName: staff.firstName,
      lastName: staff.lastName,
      role: staff.role,
    };
  }
}
