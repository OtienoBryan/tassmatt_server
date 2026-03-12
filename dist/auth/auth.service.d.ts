import { Repository } from 'typeorm';
import { Staff } from '../entities/staff.entity';
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
export declare class AuthService {
    private staffRepository;
    constructor(staffRepository: Repository<Staff>);
    login(loginDto: LoginDto): Promise<AuthResponse>;
    validateToken(token: string): Promise<Staff | null>;
    private generateToken;
}
