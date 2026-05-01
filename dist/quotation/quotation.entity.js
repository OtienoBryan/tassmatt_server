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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationItemRecord = exports.QuotationRecord = void 0;
const typeorm_1 = require("typeorm");
let QuotationRecord = class QuotationRecord {
    id;
    customer_id;
    customer;
    mobile;
    comment;
    comment2;
    address;
    total;
    tax;
    tax_type;
    total_tax;
    total_cost;
    all_total;
    discount;
    percentage_discount;
    discount_amount;
    amount_paid;
    balance;
    staff;
    currency;
    currency_symbol;
    date;
    status;
    view;
};
exports.QuotationRecord = QuotationRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], QuotationRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], QuotationRecord.prototype, "customer_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], QuotationRecord.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: '' }),
    __metadata("design:type", String)
], QuotationRecord.prototype, "mobile", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: '' }),
    __metadata("design:type", String)
], QuotationRecord.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: '' }),
    __metadata("design:type", String)
], QuotationRecord.prototype, "comment2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, default: '' }),
    __metadata("design:type", String)
], QuotationRecord.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], QuotationRecord.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 16 }),
    __metadata("design:type", Number)
], QuotationRecord.prototype, "tax", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, default: 'Inclusive' }),
    __metadata("design:type", String)
], QuotationRecord.prototype, "tax_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], QuotationRecord.prototype, "total_tax", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], QuotationRecord.prototype, "total_cost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], QuotationRecord.prototype, "all_total", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], QuotationRecord.prototype, "discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], QuotationRecord.prototype, "percentage_discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], QuotationRecord.prototype, "discount_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], QuotationRecord.prototype, "amount_paid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], QuotationRecord.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, default: 'Website' }),
    __metadata("design:type", String)
], QuotationRecord.prototype, "staff", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, default: 'Kenya Shilling' }),
    __metadata("design:type", String)
], QuotationRecord.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, default: 'KES' }),
    __metadata("design:type", String)
], QuotationRecord.prototype, "currency_symbol", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, default: '' }),
    __metadata("design:type", String)
], QuotationRecord.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], QuotationRecord.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], QuotationRecord.prototype, "view", void 0);
exports.QuotationRecord = QuotationRecord = __decorate([
    (0, typeorm_1.Entity)({ name: 'quotation' })
], QuotationRecord);
let QuotationItemRecord = class QuotationItemRecord {
    id;
    quote_id;
    customer_id;
    sale_status;
    product_id;
    product_name;
    unit_price;
    quantity;
    measure;
    sub_total;
    unit_buying;
    sub_buying;
    details;
    image;
    staff;
    date;
};
exports.QuotationItemRecord = QuotationItemRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], QuotationItemRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], QuotationItemRecord.prototype, "quote_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], QuotationItemRecord.prototype, "customer_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], QuotationItemRecord.prototype, "sale_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], QuotationItemRecord.prototype, "product_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], QuotationItemRecord.prototype, "product_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 2 }),
    __metadata("design:type", Number)
], QuotationItemRecord.prototype, "unit_price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], QuotationItemRecord.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'pcs' }),
    __metadata("design:type", String)
], QuotationItemRecord.prototype, "measure", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 2 }),
    __metadata("design:type", Number)
], QuotationItemRecord.prototype, "sub_total", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], QuotationItemRecord.prototype, "unit_buying", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], QuotationItemRecord.prototype, "sub_buying", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: '' }),
    __metadata("design:type", String)
], QuotationItemRecord.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, default: '' }),
    __metadata("design:type", String)
], QuotationItemRecord.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, default: 'Website' }),
    __metadata("design:type", String)
], QuotationItemRecord.prototype, "staff", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, default: '' }),
    __metadata("design:type", String)
], QuotationItemRecord.prototype, "date", void 0);
exports.QuotationItemRecord = QuotationItemRecord = __decorate([
    (0, typeorm_1.Entity)({ name: 'quotation_items' })
], QuotationItemRecord);
//# sourceMappingURL=quotation.entity.js.map