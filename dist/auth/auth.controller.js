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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginDto) {
        try {
            console.log('Login attempt:', { email: loginDto.email });
            const result = await this.authService.login(loginDto);
            console.log('Login successful:', { email: result.staff.email, role: result.staff.role });
            return {
                token: result.token,
                staff: result.staff,
                user: result.staff,
            };
        }
        catch (error) {
            console.error('Login error:', error);
            console.error('Error message:', error?.message);
            console.error('Error stack:', error?.stack);
            throw error;
        }
    }
    async getCurrentUser(authHeader) {
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
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('admin/login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('admin/me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getCurrentUser", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('api/auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map