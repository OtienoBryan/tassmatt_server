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
exports.PoliciesController = void 0;
const common_1 = require("@nestjs/common");
const policies_service_1 = require("./policies.service");
let PoliciesController = class PoliciesController {
    policiesService;
    constructor(policiesService) {
        this.policiesService = policiesService;
    }
    async findAll() {
        return this.policiesService.findActive();
    }
    async findByType(type) {
        return this.policiesService.findActiveByType(type);
    }
    async findOne(id) {
        const idNum = parseInt(id, 10);
        if (isNaN(idNum)) {
            return null;
        }
        return this.policiesService.findActiveById(idNum);
    }
};
exports.PoliciesController = PoliciesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PoliciesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('type/:type'),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PoliciesController.prototype, "findByType", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PoliciesController.prototype, "findOne", null);
exports.PoliciesController = PoliciesController = __decorate([
    (0, common_1.Controller)('api/policies'),
    __metadata("design:paramtypes", [policies_service_1.PoliciesService])
], PoliciesController);
//# sourceMappingURL=policies.controller.js.map