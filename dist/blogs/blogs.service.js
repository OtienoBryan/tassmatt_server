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
exports.BlogsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const blog_entity_1 = require("../entities/blog.entity");
const blog_category_entity_1 = require("../entities/blog-category.entity");
let BlogsService = class BlogsService {
    blogRepository;
    blogCategoryRepository;
    constructor(blogRepository, blogCategoryRepository) {
        this.blogRepository = blogRepository;
        this.blogCategoryRepository = blogCategoryRepository;
    }
    async findPublished() {
        return this.blogRepository.find({
            where: { isPublished: true },
            relations: ['category'],
            order: { createdAt: 'DESC' },
        });
    }
    async findPublishedById(id) {
        return this.blogRepository.findOne({
            where: { id, isPublished: true },
            relations: ['category'],
        });
    }
    async findPublishedByCategory(categoryId) {
        return this.blogRepository.find({
            where: { categoryId, isPublished: true },
            relations: ['category'],
            order: { createdAt: 'DESC' },
        });
    }
    async findAllCategories() {
        return this.blogCategoryRepository.find({
            where: { isActive: true },
            order: { name: 'ASC' },
        });
    }
};
exports.BlogsService = BlogsService;
exports.BlogsService = BlogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(blog_entity_1.Blog)),
    __param(1, (0, typeorm_1.InjectRepository)(blog_category_entity_1.BlogCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], BlogsService);
//# sourceMappingURL=blogs.service.js.map