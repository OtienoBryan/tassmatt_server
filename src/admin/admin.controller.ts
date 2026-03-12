import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Dashboard statistics
  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // Products management
  @Get('products')
  async getAllProducts() {
    return this.adminService.getAllProducts();
  }

  @Get('products/:id')
  async getProductById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getProductById(id);
  }

  @Post('products')
  async createProduct(@Body() productData: any) {
    return this.adminService.createProduct(productData);
  }

  @Put('products/:id')
  async updateProduct(@Param('id', ParseIntPipe) id: number, @Body() productData: any) {
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
    } catch (error) {
      console.error('❌ [AdminController] Error updating product:', error);
      console.error('  Error message:', error.message);
      console.error('  Error stack:', error.stack);
      throw error;
    }
  }

  private getRequestHeaders() {
    // This is a placeholder - in a real implementation, you'd inject the Request object
    return { 'content-type': 'application/json' };
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteProduct(id);
  }

  // Categories management
  @Get('categories')
  async getAllCategories() {
    return this.adminService.getAllCategories();
  }

  @Get('categories/:id')
  async getCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getCategoryById(id);
  }

  @Post('categories')
  async createCategory(@Body() categoryData: any) {
    return this.adminService.createCategory(categoryData);
  }

  @Put('categories/:id')
  async updateCategory(@Param('id', ParseIntPipe) id: number, @Body() categoryData: any) {
    return this.adminService.updateCategory(id, categoryData);
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCategory(id);
  }

  // Orders management
  @Get('orders')
  async getAllOrders() {
    return this.adminService.getAllOrders();
  }

  @Get('orders/:id')
  async getOrderById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getOrderById(id);
  }

  @Put('orders/:id/status')
  async updateOrderStatus(@Param('id', ParseIntPipe) id: number, @Body() statusData: any) {
    return this.adminService.updateOrderStatus(id, statusData);
  }

  @Delete('orders/:id')
  async deleteOrder(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteOrder(id);
  }

  // Users management
  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id')
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() userData: any) {
    return this.adminService.updateUser(id, userData);
  }

  @Put('users/:id/toggle-status')
  async toggleUserStatus(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleUserStatus(id);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }

  // Blog Categories management
  @Get('blog-categories')
  async getAllBlogCategories() {
    return this.adminService.getAllBlogCategories();
  }

  @Get('blog-categories/:id')
  async getBlogCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getBlogCategoryById(id);
  }

  @Post('blog-categories')
  async createBlogCategory(@Body() categoryData: any) {
    return this.adminService.createBlogCategory(categoryData);
  }

  @Put('blog-categories/:id')
  async updateBlogCategory(@Param('id', ParseIntPipe) id: number, @Body() categoryData: any) {
    return this.adminService.updateBlogCategory(id, categoryData);
  }

  @Delete('blog-categories/:id')
  async deleteBlogCategory(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteBlogCategory(id);
  }

  // Blogs management
  @Get('blogs')
  async getAllBlogs() {
    return this.adminService.getAllBlogs();
  }

  @Get('blogs/:id')
  async getBlogById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getBlogById(id);
  }

  @Post('blogs')
  async createBlog(@Body() blogData: any) {
    return this.adminService.createBlog(blogData);
  }

  @Put('blogs/:id')
  async updateBlog(@Param('id', ParseIntPipe) id: number, @Body() blogData: any) {
    return this.adminService.updateBlog(id, blogData);
  }

  @Delete('blogs/:id')
  async deleteBlog(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteBlog(id);
  }

  // Gallery management
  @Get('gallery')
  async getAllGallery() {
    return this.adminService.getAllGallery();
  }

  @Get('gallery/:id')
  async getGalleryById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getGalleryById(id);
  }

  @Post('gallery')
  async createGallery(@Body() galleryData: any) {
    return this.adminService.createGallery(galleryData);
  }

  @Put('gallery/:id')
  async updateGallery(@Param('id', ParseIntPipe) id: number, @Body() galleryData: any) {
    return this.adminService.updateGallery(id, galleryData);
  }

  @Delete('gallery/:id')
  async deleteGallery(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteGallery(id);
  }

  // Policies management
  @Get('policies')
  async getAllPolicies() {
    return this.adminService.getAllPolicies();
  }

  @Get('policies/:id')
  async getPolicyById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getPolicyById(id);
  }

  @Get('policies/type/:type')
  async getPolicyByType(@Param('type') type: string) {
    return this.adminService.getPolicyByType(type);
  }

  @Post('policies')
  async createPolicy(@Body() policyData: any) {
    return this.adminService.createPolicy(policyData);
  }

  @Put('policies/:id')
  async updatePolicy(@Param('id', ParseIntPipe) id: number, @Body() policyData: any) {
    return this.adminService.updatePolicy(id, policyData);
  }

  @Delete('policies/:id')
  async deletePolicy(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deletePolicy(id);
  }
}
