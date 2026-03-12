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
exports.Policy = exports.PolicyType = void 0;
const typeorm_1 = require("typeorm");
var PolicyType;
(function (PolicyType) {
    PolicyType["TERMS_CONDITIONS"] = "terms_conditions";
    PolicyType["PRIVACY_POLICY"] = "privacy_policy";
    PolicyType["SHIPPING_POLICY"] = "shipping_policy";
    PolicyType["REFUND_RETURN"] = "refund_return";
    PolicyType["COOKIE_POLICY"] = "cookie_policy";
    PolicyType["DISCLAIMER"] = "disclaimer";
})(PolicyType || (exports.PolicyType = PolicyType = {}));
let Policy = class Policy {
    id;
    type;
    content;
    isActive;
    createdAt;
    updatedAt;
};
exports.Policy = Policy;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Policy.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: PolicyType }),
    __metadata("design:type", String)
], Policy.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Policy.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Policy.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Policy.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Policy.prototype, "updatedAt", void 0);
exports.Policy = Policy = __decorate([
    (0, typeorm_1.Entity)('policies')
], Policy);
//# sourceMappingURL=policy.entity.js.map