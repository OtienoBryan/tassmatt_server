import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gallery } from '../entities/gallery.entity';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(Gallery)
    private galleryRepository: Repository<Gallery>,
  ) {}

  async findActive(): Promise<Gallery[]> {
    return this.galleryRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }
}
