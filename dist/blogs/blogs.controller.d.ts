import { BlogsService } from './blogs.service';
export declare class BlogsController {
    private readonly blogsService;
    constructor(blogsService: BlogsService);
    findAll(categoryId?: string): Promise<import("../entities").Blog[]>;
    findAllCategories(): Promise<import("../entities").BlogCategory[]>;
    findOne(id: number): Promise<import("../entities").Blog | null>;
}
