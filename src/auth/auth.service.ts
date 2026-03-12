import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../entities/staff.entity';
import * as bcrypt from 'bcrypt';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  staff: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      const { email, password } = loginDto;

      console.log('AuthService.login called with email:', email);

      if (!email || !password) {
        throw new UnauthorizedException('Email and password are required');
      }

      // Find staff by email
      const staff = await this.staffRepository.findOne({
        where: { email: email.toLowerCase() },
      });

      console.log('Staff found:', staff ? 'Yes' : 'No');

      if (!staff) {
        console.log('Staff not found for email:', email);
        throw new UnauthorizedException('Invalid email or password');
      }

      // Check if staff is active
      if (!staff.isActive) {
        console.log('Staff account is inactive');
        throw new UnauthorizedException('Your account has been deactivated');
      }

      // Verify password
      console.log('Verifying password...');
      const isPasswordValid = await staff.comparePassword(password);
      console.log('Password valid:', isPasswordValid);

      if (!isPasswordValid) {
        console.log('Invalid password for email:', email);
        throw new UnauthorizedException('Invalid email or password');
      }

    // Update last login without triggering password hash
    // Use update() instead of save() to avoid triggering BeforeUpdate hooks
    await this.staffRepository.update(
      { id: staff.id },
      { lastLoginAt: new Date() }
    );

      // Generate token (simple token for now, can be upgraded to JWT later)
      const token = this.generateToken(staff);

      console.log('Login successful for:', email);

      return {
        token,
        staff: {
          id: staff.id,
          email: staff.email,
          firstName: staff.firstName,
          lastName: staff.lastName,
          role: staff.role,
        },
        user: { // Also include 'user' for backward compatibility
          id: staff.id,
          email: staff.email,
          firstName: staff.firstName,
          lastName: staff.lastName,
          role: staff.role,
        },
      };
    } catch (error: any) {
      console.error('Error in AuthService.login:', error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      
      // Re-throw UnauthorizedException as-is
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      // Wrap other errors
      throw new UnauthorizedException(error?.message || 'Login failed');
    }
  }

  async validateToken(token: string): Promise<Staff | null> {
    try {
      // Simple token validation (can be upgraded to JWT)
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const { id, email } = JSON.parse(decoded);
      
      const staff = await this.staffRepository.findOne({
        where: { id, email },
      });

      if (!staff || !staff.isActive) {
        return null;
      }

      return staff;
    } catch (error) {
      return null;
    }
  }

  private generateToken(staff: Staff): string {
    // Simple token generation (can be upgraded to JWT)
    const payload = {
      id: staff.id,
      email: staff.email,
      role: staff.role,
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }
}
