import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ImageLinks } from 'src/entities/image-links.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ImageLinkRepository extends Repository<ImageLinks> {
  constructor(private readonly datasource: DataSource) {
    super(ImageLinks, datasource.createEntityManager());
  }

  async saveImageLink(images: ImageLinks) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.save(images);
      await queryRunner.commitTransaction();
      return images;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException('internal server error');
    } finally {
      await queryRunner.release();
    }
  }
  async saveImageLinks(images: ImageLinks[]) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.save(images);
      await queryRunner.commitTransaction();
      return images;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException('internal server error');
    } finally {
      await queryRunner.release();
    }
  }
}
