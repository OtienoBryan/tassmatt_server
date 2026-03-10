import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Blog } from './blog.entity';

@Entity('blog_categories')
export class BlogCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ unique: true, nullable: true })
  slug: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Blog, blog => blog.category)
  blogs: Blog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
