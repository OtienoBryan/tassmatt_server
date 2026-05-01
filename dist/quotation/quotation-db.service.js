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
var QuotationDbService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationDbService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("typeorm");
const quotation_entity_1 = require("./quotation.entity");
let QuotationDbService = QuotationDbService_1 = class QuotationDbService {
    cfg;
    logger = new common_1.Logger(QuotationDbService_1.name);
    dataSource = null;
    constructor(cfg) {
        this.cfg = cfg;
    }
    async onModuleInit() {
        const host = this.cfg.get('QUOTATION_DB_HOST');
        const database = this.cfg.get('QUOTATION_DB_DATABASE');
        if (!host || !database) {
            this.logger.warn('QUOTATION_DB_* env vars not set — quotation DB persistence disabled.');
            return;
        }
        try {
            this.dataSource = new typeorm_1.DataSource({
                type: 'mysql',
                host,
                port: this.cfg.get('QUOTATION_DB_PORT') ?? 3306,
                username: this.cfg.get('QUOTATION_DB_USERNAME'),
                password: this.cfg.get('QUOTATION_DB_PASSWORD'),
                database,
                entities: [quotation_entity_1.QuotationRecord, quotation_entity_1.QuotationItemRecord],
                synchronize: false,
                logging: false,
            });
            await this.dataSource.initialize();
            this.logger.log(`Connected to quotation database: ${database}@${host}`);
        }
        catch (err) {
            this.logger.error(`Could not connect to quotation database: ${err instanceof Error ? err.message : String(err)}`);
            this.dataSource = null;
        }
    }
    async onModuleDestroy() {
        if (this.dataSource?.isInitialized) {
            await this.dataSource.destroy();
        }
    }
    async saveQuotation(data) {
        if (!this.dataSource?.isInitialized) {
            this.logger.warn('Quotation DB not available — skipping DB save.');
            return;
        }
        const dateStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const subtotal = Number(data.subtotal) || 0;
        const taxAmount = Number(data.tax) || 0;
        const total = Number(data.total) || 0;
        const quotationRepo = this.dataSource.getRepository(quotation_entity_1.QuotationRecord);
        const itemRepo = this.dataSource.getRepository(quotation_entity_1.QuotationItemRecord);
        const quotation = quotationRepo.create({
            customer_id: 0,
            customer: data.customerName,
            mobile: data.customerPhone ?? '',
            comment: data.deliveryAddress ?? '',
            comment2: [data.quotationRef, data.notes].filter(Boolean).join(' — '),
            address: data.deliveryAddress ?? '',
            total: subtotal,
            tax: 16,
            tax_type: 'Inclusive',
            total_tax: taxAmount,
            total_cost: subtotal,
            all_total: total,
            discount: 0,
            percentage_discount: 0,
            discount_amount: 0,
            amount_paid: 0,
            balance: total,
            staff: 'Website',
            currency: 'Kenya Shilling',
            currency_symbol: 'KES',
            date: dateStr,
            status: 0,
            view: 0,
        });
        await quotationRepo.save(quotation);
        this.logger.log(`Saved quotation header id=${quotation.id} for ${data.customerName}`);
        for (const item of data.items) {
            const row = itemRepo.create({
                quote_id: quotation.id,
                customer_id: 0,
                sale_status: 0,
                product_id: 0,
                product_name: item.productName,
                unit_price: item.unitPrice,
                quantity: item.quantity,
                measure: 'pcs',
                sub_total: item.lineTotal,
                unit_buying: 0,
                sub_buying: 0,
                details: '',
                image: '',
                staff: 'Website',
                date: dateStr,
            });
            await itemRepo.save(row);
        }
        this.logger.log(`Saved ${data.items.length} quotation item(s) for quotation id=${quotation.id}`);
    }
};
exports.QuotationDbService = QuotationDbService;
exports.QuotationDbService = QuotationDbService = QuotationDbService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], QuotationDbService);
//# sourceMappingURL=quotation-db.service.js.map