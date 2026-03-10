import { Blog } from './blog.entity';
export declare class BlogCategory {
    id: number;
    name: string;
    description: string;
    slug: string;
    isActive: boolean;
    blogs: Blog[];
    createdAt: Date;
    updatedAt: Date;
}
