import { AuthService } from './auth.service';
import type { LoginDto } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        token: string;
        staff: {
            id: number;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
        };
        user: {
            id: number;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
        };
    }>;
    getCurrentUser(authHeader: string): Promise<{
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        role: "staff" | "admin" | "manager";
    }>;
}
