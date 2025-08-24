import { Module } from '@nestjs/common';
import { SchoolProfileService } from './school-profile.service';
import { SchoolProfileController } from './school-profile.controller';
import { SchoolProfileRepository } from 'src/repositories/school-profile.repository';
import { ImageService } from '../image/image.service';
import { MinioService } from '../violation/minio.service';
import { ImageRepository } from 'src/repositories/image.repository';
import { ImageLinkRepository } from 'src/repositories/image-link.repository';

@Module({
  controllers: [SchoolProfileController],
  providers: [
    SchoolProfileService,
    SchoolProfileRepository,
    ImageService,
    MinioService,
    ImageRepository,
    ImageLinkRepository,
  ],
})
export class SchoolProfileModule {}
