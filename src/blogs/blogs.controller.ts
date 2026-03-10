import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { BlogsService } from './blogs.service';

@Controller('api/blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  async findAll(@Query('categoryId') categoryId?: string) {
    if (categoryId) {
      const categoryIdNum = parseInt(categoryId, 10);
      if (!isNaN(categoryIdNum)) {
        return this.blogsService.findPublishedByCategory(categoryIdNum);
      }
    }
    return this.blogsService.findPublished();
  }

  @Get('categories')
  async findAllCategories() {
    return this.blogsService.findAllCategories();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.blogsService.findPublishedById(id);
  }
}
