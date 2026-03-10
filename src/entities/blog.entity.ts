import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BlogCategory } from './blog-category.entity';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string;

  @Column({ nullable: true })
  image: string;

  @ManyToOne(() => BlogCategory, category => category.blogs, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: BlogCategory;

  @Column()
  categoryId: number;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ default: false })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
