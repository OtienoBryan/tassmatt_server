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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getDashboardStats() {
        return this.adminService.getDashboardStats();
    }
    async getAllProducts() {
        return this.adminService.getAllProducts();
    }
    async getProductById(id) {
        return this.adminService.getProductById(id);
    }
    async createProduct(productData) {
        return this.adminService.createProduct(productData);
    }
    async updateProduct(id, productData) {
        console.log('🚀 [AdminController] PUT /api/admin/products/:id called');
        console.log('  ID:', id);
        console.log('  Request Body:', JSON.stringify(productData, null, 2));
        console.log('  Brand ID in request:', productData.brandId);
        console.log('  Brand ID type:', typeof productData.brandId);
        console.log('  Brand name in request:', productData.brand);
        console.log('  Brand name type:', typeof productData.brand);
        console.log('  Subcategory ID in request:', productData.subcategoryId);
        console.log('  Subcategory ID type:', typeof productData.subcategoryId);
        console.log('  Headers:', JSON.stringify(this.getRequestHeaders(), null, 2));
        try {
            const result = await this.adminService.updateProduct(id, productData);
            console.log('✅ [AdminController] Product updated successfully');
            console.log('  Response brandId:', result?.brandId);
            console.log('  Response brand:', result?.brand);
            console.log('  Response subcategoryId:', result?.subcategoryId);
            console.log('  Response subcategory:', result?.subcategory);
            return result;
        }
        catch (error) {
            console.error('❌ [AdminController] Error updating product:', error);
            console.error('  Error message:', error.message);
            console.error('  Error stack:', error.stack);
            throw error;
        }
    }
    getRequestHeaders() {
        return { 'content-type': 'application/json' };
    }
    async deleteProduct(id) {
        return this.adminService.deleteProduct(id);
    }
    async getAllCategories() {
        return this.adminService.getAllCategories();
    }
    async getCategoryById(id) {
        return this.adminService.getCategoryById(id);
    }
    async createCategory(categoryData) {
        return this.adminService.createCategory(categoryData);
    }
    async updateCategory(id, categoryData) {
        return this.adminService.updateCategory(id, categoryData);
    }
    async deleteCategory(id) {
        return this.adminService.deleteCategory(id);
    }
    async getAllOrders() {
        return this.adminService.getAllOrders();
    }
    async getOrderById(id) {
        return this.adminService.getOrderById(id);
    }
    async updateOrderStatus(id, statusData) {
        return this.adminService.updateOrderStatus(id, statusData);
    }
    async deleteOrder(id) {
        return this.adminService.deleteOrder(id);
    }
    async getAllUsers() {
        return this.adminService.getAllUsers();
    }
    async getUserById(id) {
        return this.adminService.getUserById(id);
    }
    async updateUser(id, userData) {
        return this.adminService.updateUser(id, userData);
    }
    async toggleUserStatus(id) {
        return this.adminService.toggleUserStatus(id);
    }
    async deleteUser(id) {
        return this.adminService.deleteUser(id);
    }
    async getAllBlogCategories() {
        return this.adminService.getAllBlogCategories();
    }
    async getBlogCategoryById(id) {
        return this.adminService.getBlogCategoryById(id);
    }
    async createBlogCategory(categoryData) {
        return this.adminService.createBlogCategory(categoryData);
    }
    async updateBlogCategory(id, categoryData) {
        return this.adminService.updateBlogCategory(id, categoryData);
    }
    async deleteBlogCategory(id) {
        return this.adminService.deleteBlogCategory(id);
    }
    async getAllBlogs() {
        return this.adminService.getAllBlogs();
    }
    async getBlogById(id) {
        return this.adminService.getBlogById(id);
    }
    async createBlog(blogData) {
        return this.adminService.createBlog(blogData);
    }
    async updateBlog(id, blogData) {
        return this.adminService.updateBlog(id, blogData);
    }
    async deleteBlog(id) {
        return this.adminService.deleteBlog(id);
    }
    async getAllGallery() {
        return this.adminService.getAllGallery();
    }
    async getGalleryById(id) {
        return this.adminService.getGalleryById(id);
    }
    async createGallery(galleryData) {
        return this.adminService.createGallery(galleryData);
    }
    async updateGallery(id, galleryData) {
        return this.adminService.updateGallery(id, galleryData);
    }
    async deleteGallery(id) {
        return this.adminService.deleteGallery(id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('products'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllProducts", null);
__decorate([
    (0, common_1.Get)('products/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getProductById", null);
__decorate([
    (0, common_1.Post)('products'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Put)('products/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)('products/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllCategories", null);
__decorate([
    (0, common_1.Get)('categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCategoryById", null);
__decorate([
    (0, common_1.Post)('categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Put)('categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Get)('orders'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllOrders", null);
__decorate([
    (0, common_1.Get)('orders/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.Put)('orders/:id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Delete)('orders/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteOrder", null);
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Put)('users/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Put)('users/:id/toggle-status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "toggleUserStatus", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('blog-categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllBlogCategories", null);
__decorate([
    (0, common_1.Get)('blog-categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getBlogCategoryById", null);
__decorate([
    (0, common_1.Post)('blog-categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createBlogCategory", null);
__decorate([
    (0, common_1.Put)('blog-categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateBlogCategory", null);
__decorate([
    (0, common_1.Delete)('blog-categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteBlogCategory", null);
__decorate([
    (0, common_1.Get)('blogs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllBlogs", null);
__decorate([
    (0, common_1.Get)('blogs/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getBlogById", null);
__decorate([
    (0, common_1.Post)('blogs'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createBlog", null);
__decorate([
    (0, common_1.Put)('blogs/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateBlog", null);
__decorate([
    (0, common_1.Delete)('blogs/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteBlog", null);
__decorate([
    (0, common_1.Get)('gallery'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllGallery", null);
__decorate([
    (0, common_1.Get)('gallery/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getGalleryById", null);
__decorate([
    (0, common_1.Post)('gallery'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createGallery", null);
__decorate([
    (0, common_1.Put)('gallery/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateGallery", null);
__decorate([
    (0, common_1.Delete)('gallery/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteGallery", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('api/admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map