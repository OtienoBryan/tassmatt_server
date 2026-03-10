import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { Blog } from '../entities/blog.entity';
import { BlogCategory } from '../entities/blog-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Blog, BlogCategory])],
  controllers: [BlogsController],
  providers: [BlogsService],
  exports: [BlogsService],
})
export class BlogsModule {}
