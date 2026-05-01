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
var QuotationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationController = void 0;
const common_1 = require("@nestjs/common");
const email_service_1 = require("../email/email.service");
const quotation_db_service_1 = require("./quotation-db.service");
let refCounter = 1;
function generateRef() {
    const ts = Date.now().toString(36).toUpperCase();
    const seq = String(refCounter++).padStart(3, '0');
    return `QT-${ts}-${seq}`;
}
let QuotationController = QuotationController_1 = class QuotationController {
    emailService;
    quotationDb;
    logger = new common_1.Logger(QuotationController_1.name);
    constructor(emailService, quotationDb) {
        this.emailService = emailService;
        this.quotationDb = quotationDb;
    }
    async requestQuotation(body) {
        this.logger.log(`Quotation request from ${body.customerEmail} — ${body.items?.length ?? 0} item(s)`);
        if (!body.customerEmail || !body.items?.length) {
            return { success: false, message: 'Email and items are required.' };
        }
        const ref = generateRef();
        try {
            await this.emailService.sendQuotation({
                customerName: body.customerName,
                customerEmail: body.customerEmail,
                customerPhone: body.customerPhone,
                deliveryAddress: body.deliveryAddress,
                notes: body.notes,
                items: body.items,
                subtotal: body.subtotal,
                tax: body.tax,
                total: body.total,
                quotationRef: ref,
                validDays: 7,
            });
            this.logger.log(`Quotation ${ref} sent to ${body.customerEmail}`);
            this.quotationDb
                .saveQuotation({
                quotationRef: ref,
                customerName: body.customerName,
                customerEmail: body.customerEmail,
                customerPhone: body.customerPhone ?? null,
                deliveryAddress: body.deliveryAddress ?? null,
                notes: body.notes ?? null,
                items: body.items,
                subtotal: body.subtotal,
                tax: body.tax,
                total: body.total,
            })
                .catch((dbErr) => this.logger.error(`DB save failed for ${ref}: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`));
            return { success: true, quotationRef: ref };
        }
        catch (err) {
            this.logger.error(`Failed to send quotation ${ref}: ${err instanceof Error ? err.message : String(err)}`);
            return { success: false, message: 'Failed to send quotation email. Please try again.' };
        }
    }
};
exports.QuotationController = QuotationController;
__decorate([
    (0, common_1.Post)('request'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QuotationController.prototype, "requestQuotation", null);
exports.QuotationController = QuotationController = QuotationController_1 = __decorate([
    (0, common_1.Controller)('api/quotations'),
    __metadata("design:paramtypes", [email_service_1.EmailService,
        quotation_db_service_1.QuotationDbService])
], QuotationController);
//# sourceMappingURL=quotation.controller.js.map