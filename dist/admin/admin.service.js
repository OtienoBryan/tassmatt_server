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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../entities/product.entity");
const category_entity_1 = require("../entities/category.entity");
const order_entity_1 = require("../entities/order.entity");
const user_entity_1 = require("../entities/user.entity");
const brand_entity_1 = require("../entities/brand.entity");
const subcategory_entity_1 = require("../entities/subcategory.entity");
const blog_entity_1 = require("../entities/blog.entity");
const blog_category_entity_1 = require("../entities/blog-category.entity");
const gallery_entity_1 = require("../entities/gallery.entity");
let AdminService = class AdminService {
    productRepository;
    categoryRepository;
    orderRepository;
    userRepository;
    brandRepository;
    subCategoryRepository;
    blogRepository;
    blogCategoryRepository;
    galleryRepository;
    constructor(productRepository, categoryRepository, orderRepository, userRepository, brandRepository, subCategoryRepository, blogRepository, blogCategoryRepository, galleryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.brandRepository = brandRepository;
        this.subCategoryRepository = subCategoryRepository;
        this.blogRepository = blogRepository;
        this.blogCategoryRepository = blogCategoryRepository;
        this.galleryRepository = galleryRepository;
    }
    async getDashboardStats() {
        const [totalProducts, totalCategories, totalOrders, totalUsers, recentOrders] = await Promise.all([
            this.productRepository.count({ where: { isActive: true } }),
            this.categoryRepository.count({ where: { isActive: true } }),
            this.orderRepository.count(),
            this.userRepository.count(),
            this.orderRepository.find({
                relations: ['user', 'items', 'items.product'],
                order: { createdAt: 'DESC' },
                take: 5,
            }),
        ]);
        const topProducts = await this.productRepository.find({
            where: { isFeatured: true, isActive: true },
            relations: ['category'],
            take: 5,
        });
        return {
            totalProducts,
            totalCategories,
            totalOrders,
            totalUsers,
            recentOrders: recentOrders.map(order => ({
                id: order.id,
                orderNumber: order.orderNumber,
                user: order.user,
                total: order.total,
                status: order.status,
                paymentStatus: order.paymentStatus,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
            })),
            topProducts,
        };
    }
    async getAllProducts() {
        const products = await this.productRepository.find({
            relations: ['category', 'brandEntity', 'subcategory'],
            order: { createdAt: 'DESC' },
            select: ['id', 'name', 'description', 'price', 'originalPrice', 'stock', 'image', 'images', 'brand', 'brandId', 'alcoholContent', 'volume', 'origin', 'tags', 'rating', 'reviewCount', 'isActive', 'isFeatured', 'isPopular', 'requiresAgeVerification', 'categoryId', 'subcategoryId', 'createdAt', 'updatedAt']
        });
        return products.map(product => ({
            ...product,
            brandId: product.brandId || null,
            brand: product.brand || (product.brandEntity ? product.brandEntity.name : ''),
            brandEntity: undefined
        }));
    }
    async getProductById(id) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['category', 'brandEntity', 'subcategory'],
            select: ['id', 'name', 'description', 'price', 'originalPrice', 'stock', 'image', 'images', 'brand', 'brandId', 'alcoholContent', 'volume', 'origin', 'tags', 'rating', 'reviewCount', 'isActive', 'isFeatured', 'isPopular', 'requiresAgeVerification', 'categoryId', 'subcategoryId', 'createdAt', 'updatedAt']
        });
        if (!product)
            return null;
        return {
            ...product,
            brandId: product.brandId || null,
            brand: product.brand || (product.brandEntity ? product.brandEntity.name : ''),
            brandEntity: undefined
        };
    }
    async createProduct(productData) {
        console.log('  Processing brandId for product creation...');
        console.log('    productData.brandId:', productData.brandId, '(type:', typeof productData.brandId, ')');
        if (productData.brandId !== undefined && productData.brandId !== null && productData.brandId !== '') {
            const brandId = typeof productData.brandId === 'string' ? parseInt(productData.brandId) : productData.brandId;
            console.log('    Parsed brandId:', brandId, '(type:', typeof brandId, ')');
            if (brandId && !isNaN(brandId)) {
                const brand = await this.brandRepository.findOne({ where: { id: brandId } });
                console.log('    Found brand in database:', brand);
                if (brand) {
                    productData.brand = brand.name;
                    productData.brandId = brandId;
                    console.log('  ✅ Set brand name from brandId:', brand.name);
                }
                else {
                    console.log('  ⚠️ Warning: Brand not found for brandId:', brandId);
                    productData.brand = '';
                    productData.brandId = null;
                }
            }
            else {
                productData.brand = '';
                productData.brandId = null;
                console.log('  🗑️ Cleared brand name as brandId is empty or invalid');
            }
        }
        else {
            console.log('  ℹ️ No brandId provided for product creation');
        }
        if (productData.subcategoryId !== undefined && productData.subcategoryId !== null) {
            const subcategoryId = parseInt(productData.subcategoryId);
            if (subcategoryId && !isNaN(subcategoryId)) {
                productData.subcategoryId = subcategoryId;
                console.log('  Set subcategoryId:', subcategoryId);
            }
            else {
                productData.subcategoryId = null;
                console.log('  Cleared subcategoryId as it is empty or invalid');
            }
        }
        else {
            productData.subcategoryId = null;
        }
        const product = this.productRepository.create(productData);
        return this.productRepository.save(product);
    }
    async updateProduct(id, productData) {
        console.log('🔧 [AdminService] updateProduct called with:');
        console.log('  ID:', id);
        console.log('  Product Data:', JSON.stringify(productData, null, 2));
        console.log('  Subcategory ID in request:', productData.subcategoryId);
        console.log('  Subcategory ID type:', typeof productData.subcategoryId);
        console.log('  Brand ID in request:', productData.brandId);
        console.log('  Brand ID type:', typeof productData.brandId);
        const currentProduct = await this.productRepository.findOne({
            where: { id },
            relations: ['subcategory', 'brandEntity', 'category']
        });
        console.log('  Current Product before update:');
        console.log('    Current subcategoryId:', currentProduct?.subcategoryId);
        console.log('    Current subcategory:', currentProduct?.subcategory);
        console.log('    Current brandId:', currentProduct?.brandId);
        console.log('    Current brandEntity:', currentProduct?.brandEntity);
        console.log('  Processing brandId update...');
        console.log('    productData.brandId:', productData.brandId, '(type:', typeof productData.brandId, ')');
        console.log('    productData.brand:', productData.brand, '(type:', typeof productData.brand, ')');
        if (productData.brandId !== undefined && productData.brandId !== null && productData.brandId !== '' && productData.brandId !== 0) {
            const brandId = typeof productData.brandId === 'string' ? parseInt(productData.brandId) : productData.brandId;
            console.log('    Parsed brandId:', brandId, '(type:', typeof brandId, ')');
            if (brandId && !isNaN(brandId) && brandId > 0) {
                const brand = await this.brandRepository.findOne({ where: { id: brandId } });
                console.log('    Found brand in database:', brand);
                if (brand) {
                    productData.brand = brand.name;
                    productData.brandId = brandId;
                    console.log('  ✅ Updated brand name from brandId:', brand.name);
                }
                else {
                    console.log('  ⚠️ Warning: Brand not found for brandId:', brandId);
                    console.log('  ℹ️ Keeping existing brand data due to lookup failure');
                }
            }
            else {
                productData.brand = '';
                productData.brandId = null;
                console.log('  🗑️ Cleared brand name as brandId is invalid');
            }
        }
        else if (productData.brandId === null || productData.brandId === '') {
            productData.brand = '';
            productData.brandId = null;
            console.log('  🗑️ Explicitly cleared brand data');
        }
        else {
            console.log('  ℹ️ No brandId provided in request data - keeping existing brand');
            delete productData.brandId;
            delete productData.brand;
        }
        const existingProduct = await this.productRepository.findOne({
            where: { id },
            relations: ['category', 'brandEntity', 'subcategory']
        });
        if (!existingProduct) {
            throw new Error(`Product with ID ${id} not found`);
        }
        const existingCategoryId = existingProduct.categoryId;
        console.log('  Processing categoryId...');
        console.log('    categoryId in request:', productData.categoryId, '(type:', typeof productData.categoryId, ')');
        console.log('    Existing categoryId:', existingCategoryId);
        if (productData.categoryId !== undefined && productData.categoryId !== null && productData.categoryId !== '' && productData.categoryId !== 0) {
            const categoryId = typeof productData.categoryId === 'string' ? parseInt(productData.categoryId) : productData.categoryId;
            console.log('    Parsed categoryId:', categoryId, '(type:', typeof categoryId, ')');
            if (categoryId && !isNaN(categoryId) && categoryId > 0) {
                const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
                if (category) {
                    productData.categoryId = categoryId;
                    console.log('  ✅ Updated categoryId:', categoryId, 'for category:', category.name);
                }
                else {
                    console.log('  ⚠️ Warning: Category not found for categoryId:', categoryId);
                    throw new Error(`Category with ID ${categoryId} not found`);
                }
            }
            else {
                console.log('  ⚠️ Warning: Invalid categoryId:', categoryId);
                throw new Error(`Invalid categoryId: ${categoryId}`);
            }
        }
        else {
            if (existingCategoryId) {
                productData.categoryId = existingCategoryId;
                console.log('  ℹ️ No categoryId provided, keeping existing categoryId:', existingCategoryId);
            }
            else {
                console.log('  ⚠️ Warning: No categoryId provided and no existing categoryId found');
                throw new Error('categoryId is required');
            }
        }
        console.log('  Processing subcategoryId...');
        if (productData.subcategoryId !== undefined && productData.subcategoryId !== null) {
            const subcategoryId = parseInt(productData.subcategoryId);
            console.log('    Parsed subcategoryId:', subcategoryId);
            if (subcategoryId && !isNaN(subcategoryId)) {
                const subcategory = await this.subCategoryRepository.findOne({ where: { id: subcategoryId } });
                if (subcategory) {
                    productData.subcategoryId = subcategoryId;
                    console.log('  ✅ Updated subcategoryId:', subcategoryId, 'for subcategory:', subcategory.name);
                }
                else {
                    console.log('  ⚠️ Warning: Subcategory not found for subcategoryId:', subcategoryId);
                    productData.subcategoryId = null;
                }
            }
            else {
                productData.subcategoryId = null;
                console.log('  Cleared subcategoryId as it is empty or invalid');
            }
        }
        else {
            console.log('  No subcategoryId in request data');
        }
        console.log('  Final productData before database update:');
        console.log('    categoryId:', productData.categoryId);
        console.log('    brandId:', productData.brandId);
        console.log('    brand:', productData.brand);
        console.log('    subcategoryId:', productData.subcategoryId);
        console.log('    skus:', productData.skus);
        console.log('    Full data:', JSON.stringify(productData, null, 2));
        console.log('  Existing product before merge:', JSON.stringify(existingProduct, null, 2));
        const { category, subcategory, brandEntity, id: _bodyId, createdAt, updatedAt, ...updateData } = productData;
        const fieldsToUpdate = {
            name: updateData.name ?? existingProduct.name,
            description: updateData.description ?? existingProduct.description,
            price: updateData.price ?? existingProduct.price,
            originalPrice: updateData.originalPrice ?? existingProduct.originalPrice,
            stock: updateData.stock ?? existingProduct.stock,
            image: updateData.image ?? existingProduct.image,
            images: updateData.images ?? existingProduct.images,
            tags: updateData.tags ?? existingProduct.tags,
            rating: updateData.rating ?? existingProduct.rating,
            reviewCount: updateData.reviewCount ?? existingProduct.reviewCount,
            isActive: updateData.isActive ?? existingProduct.isActive,
            isFeatured: updateData.isFeatured ?? existingProduct.isFeatured,
            isPopular: updateData.isPopular ?? existingProduct.isPopular,
            requiresAgeVerification: updateData.requiresAgeVerification ?? existingProduct.requiresAgeVerification,
            brand: updateData.brand ?? existingProduct.brand,
            brandId: updateData.brandId ?? existingProduct.brandId,
            alcoholContent: updateData.alcoholContent ?? existingProduct.alcoholContent,
            volume: updateData.volume ?? existingProduct.volume,
            origin: updateData.origin ?? existingProduct.origin,
            subcategoryId: updateData.subcategoryId ?? existingProduct.subcategoryId,
            categoryId: productData.categoryId ?? existingProduct.categoryId,
        };
        if (updateData.skus !== undefined) {
            fieldsToUpdate.skus = updateData.skus;
        }
        console.log('  Fields to update:', {
            productId: id,
            categoryId: fieldsToUpdate.categoryId,
            name: fieldsToUpdate.name,
            price: fieldsToUpdate.price,
            brandId: fieldsToUpdate.brandId,
            subcategoryId: fieldsToUpdate.subcategoryId
        });
        try {
            await this.productRepository.update(id, fieldsToUpdate);
            console.log('  ✅ Database update successful');
        }
        catch (updateError) {
            console.error('  ❌ Database update error:', updateError);
            console.error('  Error details:', {
                message: updateError?.message,
                code: updateError?.code,
                errno: updateError?.errno,
                sqlMessage: updateError?.sqlMessage,
                sql: updateError?.sql,
                stack: updateError?.stack
            });
            throw new Error(`Failed to update product: ${updateError?.message || 'Unknown error'}`);
        }
        const updatedProduct = await this.getProductById(id);
        console.log('  Updated Product after database query:');
        console.log('    categoryId:', updatedProduct?.categoryId);
        console.log('    category:', updatedProduct?.category);
        console.log('    brandId:', updatedProduct?.brandId);
        console.log('    brand:', updatedProduct?.brand);
        console.log('    subcategoryId:', updatedProduct?.subcategoryId);
        console.log('    subcategory:', updatedProduct?.subcategory);
        console.log('    Full updated product:', JSON.stringify(updatedProduct, null, 2));
        return updatedProduct;
    }
    async deleteProduct(id) {
        return this.productRepository.delete(id);
    }
    async getAllCategories() {
        return this.categoryRepository.find({
            order: { name: 'ASC' },
        });
    }
    async getCategoryById(id) {
        return this.categoryRepository.findOne({
            where: { id },
        });
    }
    async createCategory(categoryData) {
        const category = this.categoryRepository.create(categoryData);
        return this.categoryRepository.save(category);
    }
    async updateCategory(id, categoryData) {
        await this.categoryRepository.update(id, categoryData);
        return this.getCategoryById(id);
    }
    async deleteCategory(id) {
        return this.categoryRepository.delete(id);
    }
    async getAllOrders() {
        return this.orderRepository.find({
            relations: ['user', 'items', 'items.product'],
            order: { createdAt: 'DESC' },
        });
    }
    async getOrderById(id) {
        return this.orderRepository.findOne({
            where: { id },
            relations: ['user', 'items', 'items.product'],
        });
    }
    async updateOrderStatus(id, statusData) {
        await this.orderRepository.update(id, statusData);
        return this.getOrderById(id);
    }
    async deleteOrder(id) {
        return this.orderRepository.delete(id);
    }
    async getAllUsers() {
        return this.userRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async getUserById(id) {
        return this.userRepository.findOne({
            where: { id },
        });
    }
    async updateUser(id, userData) {
        await this.userRepository.update(id, userData);
        return this.getUserById(id);
    }
    async toggleUserStatus(id) {
        const user = await this.getUserById(id);
        if (user) {
            user.isActive = !user.isActive;
            return this.userRepository.save(user);
        }
        return null;
    }
    async deleteUser(id) {
        return this.userRepository.delete(id);
    }
    async getAllBlogCategories() {
        return this.blogCategoryRepository.find({
            where: { isActive: true },
            order: { name: 'ASC' },
        });
    }
    async getBlogCategoryById(id) {
        return this.blogCategoryRepository.findOne({
            where: { id, isActive: true },
        });
    }
    async createBlogCategory(categoryData) {
        const category = this.blogCategoryRepository.create(categoryData);
        return this.blogCategoryRepository.save(category);
    }
    async updateBlogCategory(id, categoryData) {
        const result = await this.blogCategoryRepository.update(id, categoryData);
        if (result.affected === 0) {
            return null;
        }
        return this.blogCategoryRepository.findOne({ where: { id } });
    }
    async deleteBlogCategory(id) {
        return this.blogCategoryRepository.delete(id);
    }
    async getAllBlogs() {
        return this.blogRepository.find({
            relations: ['category'],
            order: { createdAt: 'DESC' },
        });
    }
    async getBlogById(id) {
        return this.blogRepository.findOne({
            where: { id },
            relations: ['category'],
        });
    }
    async createBlog(blogData) {
        const blog = this.blogRepository.create(blogData);
        return this.blogRepository.save(blog);
    }
    async updateBlog(id, blogData) {
        const result = await this.blogRepository.update(id, blogData);
        if (result.affected === 0) {
            return null;
        }
        return this.getBlogById(id);
    }
    async deleteBlog(id) {
        return this.blogRepository.delete(id);
    }
    async getAllGallery() {
        return this.galleryRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async getGalleryById(id) {
        return this.galleryRepository.findOne({
            where: { id },
        });
    }
    async createGallery(galleryData) {
        const gallery = this.galleryRepository.create(galleryData);
        return this.galleryRepository.save(gallery);
    }
    async updateGallery(id, galleryData) {
        const result = await this.galleryRepository.update(id, galleryData);
        if (result.affected === 0) {
            return null;
        }
        return this.getGalleryById(id);
    }
    async deleteGallery(id) {
        return this.galleryRepository.delete(id);
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(2, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(4, (0, typeorm_1.InjectRepository)(brand_entity_1.Brand)),
    __param(5, (0, typeorm_1.InjectRepository)(subcategory_entity_1.SubCategory)),
    __param(6, (0, typeorm_1.InjectRepository)(blog_entity_1.Blog)),
    __param(7, (0, typeorm_1.InjectRepository)(blog_category_entity_1.BlogCategory)),
    __param(8, (0, typeorm_1.InjectRepository)(gallery_entity_1.Gallery)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map