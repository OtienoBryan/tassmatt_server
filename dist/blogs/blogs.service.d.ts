import { Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';
import { BlogCategory } from '../entities/blog-category.entity';
export declare class BlogsService {
    private blogRepository;
    private blogCategoryRepository;
    constructor(blogRepository: Repository<Blog>, blogCategoryRepository: Repository<BlogCategory>);
    findPublished(): Promise<Blog[]>;
    findPublishedById(id: number): Promise<Blog | null>;
    findPublishedByCategory(categoryId: number): Promise<Blog[]>;
    findAllCategories(): Promise<BlogCategory[]>;
}
