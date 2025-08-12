import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateImageDto } from './dto/update-image.dto';
import { MinioService } from '../violation/minio.service';
import * as sharp from 'sharp';
import { randomUUID } from 'crypto';
import { ImageRepository } from 'src/repositories/image.repository';
import { ImageLinkRepository } from 'src/repositories/image-link.repository';
import { ImageLinks } from 'src/entities/image-links.entity';

@Injectable()
export class ImageService {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly imageLinkRepository: ImageLinkRepository,
    private minio: MinioService,
  ) {}

  async getStream(id: number) {
    const image = await this.imageRepository.findOneBy({ id });
    if (!image) throw new NotFoundException('Image not found');

    const stream = await this.minio.getObjectStream(image.key);
    if (!stream.readable) {
      throw new InternalServerErrorException('Stream not readable');
    }
    return { stream, image };
  }

  async processAndUpload(files: Express.Multer.File[]): Promise<number> {
    // Resize & compress with sharp
    const imageLinks: ImageLinks[] = [];
    const query = await this.imageLinkRepository.query(
      'SELECT MAX(id) from image_links',
    );
    const maxId = query[0].max || 0;
    // const maxId = await this.imageLinkRepository.maximum('id');
    for (const file of files) {
      let resized: Buffer;
      try {
        resized = await sharp(file.buffer)
          .rotate()
          .resize({ width: 1200, withoutEnlargement: true }) // contoh: max width 1200
          .jpeg({ quality: 75 })
          .toBuffer();
      } catch (e) {
        console.log(e);
      }

      const key = `${Date.now()}-${randomUUID()}.${file.mimetype.split('/')[1]}`;

      await this.minio.uploadBuffer(key, resized, 'image/jpeg');

      const img = this.imageRepository.create({
        originalName: file.originalname,
        key,
        mimetype: 'image/jpeg',
        size: resized.length,
      });
      const savedImage = await this.imageRepository.saveImage(img);

      const imageLink = this.imageLinkRepository.create({
        id: maxId + 1,
        image: savedImage,
        imageId: savedImage.id,
      });
      imageLinks.push(imageLink);
    }
    await this.imageLinkRepository.saveImageLinks(imageLinks);
    return maxId + 1;
  }

  findAll() {
    return `This action returns all image`;
  }

  async findOne(id: number) {
    try {
      const imageLinks = await this.imageLinkRepository.find({ where: { id } });
      const imageIds = imageLinks.map((il) => il.imageId);
      return imageIds;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('internal server error');
    }
  }

  update(id: number, updateImageDto: UpdateImageDto) {
    console.log(updateImageDto);
    return `This action updates a #${id} image`;
  }

  remove(id: number) {
    return `This action removes a #${id} image`;
  }
}
