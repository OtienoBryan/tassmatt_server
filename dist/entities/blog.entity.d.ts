import { BlogCategory } from './blog-category.entity';
export declare class Blog {
    id: number;
    title: string;
    content: string;
    excerpt: string;
    image: string;
    category: BlogCategory;
    categoryId: number;
    tags: string[];
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}
