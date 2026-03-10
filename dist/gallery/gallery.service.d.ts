import { Repository } from 'typeorm';
import { Gallery } from '../entities/gallery.entity';
export declare class GalleryService {
    private galleryRepository;
    constructor(galleryRepository: Repository<Gallery>);
    findActive(): Promise<Gallery[]>;
}
