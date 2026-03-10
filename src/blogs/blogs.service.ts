import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';
import { BlogCategory } from '../entities/blog-category.entity';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
    @InjectRepository(BlogCategory)
    private blogCategoryRepository: Repository<BlogCategory>,
  ) {}

  async findPublished(): Promise<Blog[]> {
    return this.blogRepository.find({
      where: { isPublished: true },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPublishedById(id: number): Promise<Blog | null> {
    return this.blogRepository.findOne({
      where: { id, isPublished: true },
      relations: ['category'],
    });
  }

  async findPublishedByCategory(categoryId: number): Promise<Blog[]> {
    return this.blogRepository.find({
      where: { categoryId, isPublished: true },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllCategories(): Promise<BlogCategory[]> {
    return this.blogCategoryRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }
}
