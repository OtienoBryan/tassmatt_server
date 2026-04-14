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
var MpesaController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MpesaController = void 0;
const common_1 = require("@nestjs/common");
const mpesa_service_1 = require("./mpesa.service");
let MpesaController = MpesaController_1 = class MpesaController {
    mpesaService;
    logger = new common_1.Logger(MpesaController_1.name);
    constructor(mpesaService) {
        this.mpesaService = mpesaService;
    }
    stkConfigured() {
        return { configured: this.mpesaService.isConfigured() };
    }
    async stkPush(body) {
        this.logger.log(`POST stk-push body keys=${Object.keys(body ?? {}).join(',')} orderId=${String(body?.orderId)}`);
        const orderId = Number(body.orderId);
        const phoneNumber = typeof body.phoneNumber === 'string' ? body.phoneNumber : '';
        if (!Number.isFinite(orderId) || orderId < 1) {
            this.logger.warn(`stk-push 400: invalid orderId raw=${JSON.stringify(body?.orderId)}`);
            throw new common_1.BadRequestException('orderId is required');
        }
        if (!phoneNumber.trim()) {
            this.logger.warn('stk-push 400: missing phoneNumber');
            throw new common_1.BadRequestException('phoneNumber is required');
        }
        try {
            return await this.mpesaService.initiateStkPush(orderId, phoneNumber);
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            this.logger.warn(`stk-push failed orderId=${orderId}: ${msg}`);
            throw e;
        }
    }
    async orderPaymentStatus(orderIdRaw, checkoutRequestId) {
        const orderId = Number(orderIdRaw);
        if (!Number.isFinite(orderId) || orderId < 1) {
            throw new common_1.BadRequestException('orderId is required');
        }
        if (!checkoutRequestId?.trim()) {
            throw new common_1.BadRequestException('checkoutRequestId is required');
        }
        const status = await this.mpesaService.getOrderPaymentStatus(orderId, checkoutRequestId.trim());
        if (!status) {
            throw new common_1.BadRequestException('Order not found');
        }
        return status;
    }
    async stkCallback(body) {
        try {
            await this.mpesaService.handleStkCallback(body);
        }
        catch (e) {
            console.error('M-Pesa stk-callback handler error:', e);
        }
        return { ResultCode: 0, ResultDesc: 'Accepted' };
    }
};
exports.MpesaController = MpesaController;
__decorate([
    (0, common_1.Get)('stk-configured'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MpesaController.prototype, "stkConfigured", null);
__decorate([
    (0, common_1.Post)('stk-push'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MpesaController.prototype, "stkPush", null);
__decorate([
    (0, common_1.Get)('order-payment-status'),
    __param(0, (0, common_1.Query)('orderId')),
    __param(1, (0, common_1.Query)('checkoutRequestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MpesaController.prototype, "orderPaymentStatus", null);
__decorate([
    (0, common_1.Post)('stk-callback'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MpesaController.prototype, "stkCallback", null);
exports.MpesaController = MpesaController = MpesaController_1 = __decorate([
    (0, common_1.Controller)('api/mpesa'),
    __metadata("design:paramtypes", [mpesa_service_1.MpesaService])
], MpesaController);
//# sourceMappingURL=mpesa.controller.js.map