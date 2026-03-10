import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { Order } from '../entities/order.entity';
import { User } from '../entities/user.entity';
import { Brand } from '../entities/brand.entity';
import { SubCategory } from '../entities/subcategory.entity';
import { Blog } from '../entities/blog.entity';
import { BlogCategory } from '../entities/blog-category.entity';
import { Gallery } from '../entities/gallery.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(SubCategory)
    private subCategoryRepository: Repository<SubCategory>,
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
    @InjectRepository(BlogCategory)
    private blogCategoryRepository: Repository<BlogCategory>,
    @InjectRepository(Gallery)
    private galleryRepository: Repository<Gallery>,
  ) {}

  // Dashboard statistics
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

  // Products management
  async getAllProducts() {
    const products = await this.productRepository.find({
      relations: ['category', 'brandEntity', 'subcategory'],
      order: { createdAt: 'DESC' },
      select: ['id', 'name', 'description', 'price', 'originalPrice', 'stock', 'image', 'images', 'brand', 'brandId', 'alcoholContent', 'volume', 'origin', 'tags', 'rating', 'reviewCount', 'isActive', 'isFeatured', 'isPopular', 'requiresAgeVerification', 'categoryId', 'subcategoryId', 'createdAt', 'updatedAt']
    });

    // Ensure brand data is properly mapped
    return products.map(product => ({
      ...product,
      brandId: product.brandId || null,
      brand: product.brand || (product.brandEntity ? product.brandEntity.name : ''),
      brandEntity: undefined // Remove the entity from response
    }));
  }

  async getProductById(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'brandEntity', 'subcategory'],
      select: ['id', 'name', 'description', 'price', 'originalPrice', 'stock', 'image', 'images', 'brand', 'brandId', 'alcoholContent', 'volume', 'origin', 'tags', 'rating', 'reviewCount', 'isActive', 'isFeatured', 'isPopular', 'requiresAgeVerification', 'categoryId', 'subcategoryId', 'createdAt', 'updatedAt']
    });

    if (!product) return null;

    // Ensure brand data is properly mapped
    return {
      ...product,
      brandId: product.brandId || null,
      brand: product.brand || (product.brandEntity ? product.brandEntity.name : ''),
      brandEntity: undefined // Remove the entity from response
    };
  }

  async createProduct(productData: any) {
    // Handle brand - fetch the brand name from brandId
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
          productData.brandId = brandId; // Ensure brandId is a number
          console.log('  ✅ Set brand name from brandId:', brand.name);
        } else {
          console.log('  ⚠️ Warning: Brand not found for brandId:', brandId);
          productData.brand = '';
          productData.brandId = null;
        }
      } else {
        productData.brand = '';
        productData.brandId = null;
        console.log('  🗑️ Cleared brand name as brandId is empty or invalid');
      }
    } else {
      console.log('  ℹ️ No brandId provided for product creation');
    }

    // Handle subcategoryId
    if (productData.subcategoryId !== undefined && productData.subcategoryId !== null) {
      const subcategoryId = parseInt(productData.subcategoryId);
      if (subcategoryId && !isNaN(subcategoryId)) {
        productData.subcategoryId = subcategoryId;
        console.log('  Set subcategoryId:', subcategoryId);
      } else {
        productData.subcategoryId = null;
        console.log('  Cleared subcategoryId as it is empty or invalid');
      }
    } else {
      productData.subcategoryId = null;
    }
    
    const product = this.productRepository.create(productData);
    return this.productRepository.save(product);
  }

  async updateProduct(id: number, productData: any) {
    console.log('🔧 [AdminService] updateProduct called with:');
    console.log('  ID:', id);
    console.log('  Product Data:', JSON.stringify(productData, null, 2));
    console.log('  Subcategory ID in request:', productData.subcategoryId);
    console.log('  Subcategory ID type:', typeof productData.subcategoryId);
    console.log('  Brand ID in request:', productData.brandId);
    console.log('  Brand ID type:', typeof productData.brandId);
    
    // Log the current product before update
    const currentProduct = await this.productRepository.findOne({ 
      where: { id },
      relations: ['subcategory', 'brandEntity', 'category']
    });
    console.log('  Current Product before update:');
    console.log('    Current subcategoryId:', currentProduct?.subcategoryId);
    console.log('    Current subcategory:', currentProduct?.subcategory);
    console.log('    Current brandId:', currentProduct?.brandId);
    console.log('    Current brandEntity:', currentProduct?.brandEntity);
    
    // Handle brand update - process brandId if it's provided
    console.log('  Processing brandId update...');
    console.log('    productData.brandId:', productData.brandId, '(type:', typeof productData.brandId, ')');
    console.log('    productData.brand:', productData.brand, '(type:', typeof productData.brand, ')');
    
    // Only process brandId if it's explicitly provided and not null/empty
    if (productData.brandId !== undefined && productData.brandId !== null && productData.brandId !== '' && productData.brandId !== 0) {
      const brandId = typeof productData.brandId === 'string' ? parseInt(productData.brandId) : productData.brandId;
      console.log('    Parsed brandId:', brandId, '(type:', typeof brandId, ')');
      
      if (brandId && !isNaN(brandId) && brandId > 0) {
        const brand = await this.brandRepository.findOne({ where: { id: brandId } });
        console.log('    Found brand in database:', brand);
        
        if (brand) {
          productData.brand = brand.name;
          productData.brandId = brandId; // Ensure brandId is a number
          console.log('  ✅ Updated brand name from brandId:', brand.name);
        } else {
          console.log('  ⚠️ Warning: Brand not found for brandId:', brandId);
          // Don't clear existing brand data if brand lookup fails
          console.log('  ℹ️ Keeping existing brand data due to lookup failure');
        }
      } else {
        // If brandId is invalid, clear the brand field
        productData.brand = '';
        productData.brandId = null;
        console.log('  🗑️ Cleared brand name as brandId is invalid');
      }
    } else if (productData.brandId === null || productData.brandId === '') {
      // Explicitly clearing brand
      productData.brand = '';
      productData.brandId = null;
      console.log('  🗑️ Explicitly cleared brand data');
    } else {
      console.log('  ℹ️ No brandId provided in request data - keeping existing brand');
      // Don't modify existing brand data if no brandId is provided
      delete productData.brandId;
      delete productData.brand;
    }

    // Handle subcategoryId
    console.log('  Processing subcategoryId...');
    if (productData.subcategoryId !== undefined && productData.subcategoryId !== null) {
      const subcategoryId = parseInt(productData.subcategoryId);
      console.log('    Parsed subcategoryId:', subcategoryId);
      if (subcategoryId && !isNaN(subcategoryId)) {
        // Verify subcategory exists
        const subcategory = await this.subCategoryRepository.findOne({ where: { id: subcategoryId } });
        if (subcategory) {
          productData.subcategoryId = subcategoryId;
          console.log('  ✅ Updated subcategoryId:', subcategoryId, 'for subcategory:', subcategory.name);
        } else {
          console.log('  ⚠️ Warning: Subcategory not found for subcategoryId:', subcategoryId);
          productData.subcategoryId = null;
        }
      } else {
        productData.subcategoryId = null;
        console.log('  Cleared subcategoryId as it is empty or invalid');
      }
    } else {
      console.log('  No subcategoryId in request data');
    }
    
    console.log('  Final productData before database update:');
    console.log('    brandId:', productData.brandId);
    console.log('    brand:', productData.brand);
    console.log('    subcategoryId:', productData.subcategoryId);
    console.log('    skus:', productData.skus);
    console.log('    Full data:', JSON.stringify(productData, null, 2));
    
    // Use save method instead of update for more reliable updates
    const existingProduct = await this.productRepository.findOne({ 
      where: { id },
      relations: ['category', 'brandEntity', 'subcategory']
    });
    if (!existingProduct) {
      throw new Error(`Product with ID ${id} not found`);
    }
    
    console.log('  Existing product before merge:', JSON.stringify(existingProduct, null, 2));
    
    // Merge the existing product with the new data
    const mergedProduct = { ...existingProduct, ...productData };
    
    // Explicitly ensure SKUs are included if provided
    if (productData.skus !== undefined) {
      mergedProduct.skus = productData.skus;
      console.log('  ✅ Explicitly set SKUs:', JSON.stringify(mergedProduct.skus, null, 2));
    }
    
    console.log('  Merged product data:', JSON.stringify(mergedProduct, null, 2));
    
    // Ensure brandId is properly set
    if (productData.brandId !== undefined) {
      mergedProduct.brandId = productData.brandId;
    }
    if (productData.brand !== undefined) {
      mergedProduct.brand = productData.brand;
    }
    
    console.log('  Final merged product before save:', {
      id: mergedProduct.id,
      brand: mergedProduct.brand,
      brandId: mergedProduct.brandId,
      subcategoryId: mergedProduct.subcategoryId
    });
    
    try {
      const savedProduct = await this.productRepository.save(mergedProduct);
      console.log('  Database save result:', savedProduct);
    } catch (saveError) {
      console.error('  ❌ Database save error:', saveError);
      throw saveError;
    }
    
    const updatedProduct = await this.getProductById(id);
    console.log('  Updated Product after database query:');
    console.log('    brandId:', updatedProduct?.brandId);
    console.log('    brand:', updatedProduct?.brand);
    console.log('    subcategoryId:', updatedProduct?.subcategoryId);
    console.log('    subcategory:', updatedProduct?.subcategory);
    console.log('    Full updated product:', JSON.stringify(updatedProduct, null, 2));
    
    return updatedProduct;
  }

  async deleteProduct(id: number) {
    return this.productRepository.delete(id);
  }

  // Categories management
  async getAllCategories() {
    return this.categoryRepository.find({
      order: { name: 'ASC' },
    });
  }

  async getCategoryById(id: number) {
    return this.categoryRepository.findOne({
      where: { id },
    });
  }

  async createCategory(categoryData: any) {
    const category = this.categoryRepository.create(categoryData);
    return this.categoryRepository.save(category);
  }

  async updateCategory(id: number, categoryData: any) {
    await this.categoryRepository.update(id, categoryData);
    return this.getCategoryById(id);
  }

  async deleteCategory(id: number) {
    return this.categoryRepository.delete(id);
  }

  // Orders management
  async getAllOrders() {
    return this.orderRepository.find({
      relations: ['user', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderById(id: number) {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product'],
    });
  }

  async updateOrderStatus(id: number, statusData: any) {
    await this.orderRepository.update(id, statusData);
    return this.getOrderById(id);
  }

  async deleteOrder(id: number) {
    return this.orderRepository.delete(id);
  }

  // Users management
  async getAllUsers() {
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getUserById(id: number) {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async updateUser(id: number, userData: any) {
    await this.userRepository.update(id, userData);
    return this.getUserById(id);
  }

  async toggleUserStatus(id: number) {
    const user = await this.getUserById(id);
    if (user) {
      user.isActive = !user.isActive;
      return this.userRepository.save(user);
    }
    return null;
  }

  async deleteUser(id: number) {
    return this.userRepository.delete(id);
  }

  // Blog Categories Management
  async getAllBlogCategories() {
    return this.blogCategoryRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getBlogCategoryById(id: number) {
    return this.blogCategoryRepository.findOne({
      where: { id, isActive: true },
    });
  }

  async createBlogCategory(categoryData: any) {
    const category = this.blogCategoryRepository.create(categoryData);
    return this.blogCategoryRepository.save(category);
  }

  async updateBlogCategory(id: number, categoryData: any) {
    const result = await this.blogCategoryRepository.update(id, categoryData);
    if (result.affected === 0) {
      return null;
    }
    return this.blogCategoryRepository.findOne({ where: { id } });
  }

  async deleteBlogCategory(id: number) {
    return this.blogCategoryRepository.delete(id);
  }

  // Blogs Management
  async getAllBlogs() {
    return this.blogRepository.find({
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async getBlogById(id: number) {
    return this.blogRepository.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  async createBlog(blogData: any) {
    const blog = this.blogRepository.create(blogData);
    return this.blogRepository.save(blog);
  }

  async updateBlog(id: number, blogData: any) {
    const result = await this.blogRepository.update(id, blogData);
    if (result.affected === 0) {
      return null;
    }
    return this.getBlogById(id);
  }

  async deleteBlog(id: number) {
    return this.blogRepository.delete(id);
  }

  // Gallery management
  async getAllGallery() {
    return this.galleryRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getGalleryById(id: number) {
    return this.galleryRepository.findOne({
      where: { id },
    });
  }

  async createGallery(galleryData: any) {
    const gallery = this.galleryRepository.create(galleryData);
    return this.galleryRepository.save(gallery);
  }

  async updateGallery(id: number, galleryData: any) {
    const result = await this.galleryRepository.update(id, galleryData);
    if (result.affected === 0) {
      return null;
    }
    return this.getGalleryById(id);
  }

  async deleteGallery(id: number) {
    return this.galleryRepository.delete(id);
  }
}
