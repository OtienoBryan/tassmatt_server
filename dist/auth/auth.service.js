"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const staff_entity_1 = require("../entities/staff.entity");
let AuthService = class AuthService {
    staffRepository;
    constructor(staffRepository) {
        this.staffRepository = staffRepository;
    }
    async login(loginDto) {
        try {
            const { email, password } = loginDto;
            console.log('AuthService.login called with email:', email);
            if (!email || !password) {
                throw new common_1.UnauthorizedException('Email and password are required');
            }
            const staff = await this.staffRepository.findOne({
                where: { email: email.toLowerCase() },
            });
            console.log('Staff found:', staff ? 'Yes' : 'No');
            if (!staff) {
                console.log('Staff not found for email:', email);
                throw new common_1.UnauthorizedException('Invalid email or password');
            }
            if (!staff.isActive) {
                console.log('Staff account is inactive');
                throw new common_1.UnauthorizedException('Your account has been deactivated');
            }
            console.log('Verifying password...');
            const isPasswordValid = await staff.comparePassword(password);
            console.log('Password valid:', isPasswordValid);
            if (!isPasswordValid) {
                console.log('Invalid password for email:', email);
                throw new common_1.UnauthorizedException('Invalid email or password');
            }
            await this.staffRepository.update({ id: staff.id }, { lastLoginAt: new Date() });
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
                user: {
                    id: staff.id,
                    email: staff.email,
                    firstName: staff.firstName,
                    lastName: staff.lastName,
                    role: staff.role,
                },
            };
        }
        catch (error) {
            console.error('Error in AuthService.login:', error);
            console.error('Error message:', error?.message);
            console.error('Error stack:', error?.stack);
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException(error?.message || 'Login failed');
        }
    }
    async validateToken(token) {
        try {
            const decoded = Buffer.from(token, 'base64').toString('utf-8');
            const { id, email } = JSON.parse(decoded);
            const staff = await this.staffRepository.findOne({
                where: { id, email },
            });
            if (!staff || !staff.isActive) {
                return null;
            }
            return staff;
        }
        catch (error) {
            return null;
        }
    }
    generateToken(staff) {
        const payload = {
            id: staff.id,
            email: staff.email,
            role: staff.role,
        };
        return Buffer.from(JSON.stringify(payload)).toString('base64');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(staff_entity_1.Staff)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map