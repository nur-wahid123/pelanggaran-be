import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Settings } from 'src/commons/enums/settings.enum';
import { SchoolProfileRepository } from 'src/repositories/school-profile.repository';
import { ImageService } from '../image/image.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class SchoolProfileService {
  async updateLogo(key: Settings, file: Express.Multer.File) {
    try {
      const profile = await this.schoolProfileRepository.findOne({
        where: { name: key },
      });
      if (!profile) throw new NotFoundException('Data not found');
      const data = await this.schoolProfileRepository.getNumberValue(
        Settings.SCHOOL_LOGO,
      );
      if (!data) throw new NotFoundException('Data not found');
      const image = await this.imageService.processAndUpload([file]);
      profile.value = image.toString();
      await this.schoolProfileRepository.saveSchoolProfile(profile);
      await this.imageService.remove(data);
      return true;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('internal server error');
    }
  }
  getSchoolName() {
    return this.schoolProfileRepository.getStringValue(Settings.SCHOOL_NAME);
  }

  getSchoolAddress() {
    return this.schoolProfileRepository.getStringValue(Settings.SCHOOL_ADDRESS);
  }

  async getSchoolLogo() {
    const imageId = await this.schoolProfileRepository.getNumberValue(
      Settings.SCHOOL_LOGO,
    );
    const image = await this.imageService.findOne(imageId);
    return image[0];
  }
  constructor(
    private readonly schoolProfileRepository: SchoolProfileRepository,
    private readonly imageService: ImageService,
  ) {}

  async init() {
    await this.insertString(Settings.SCHOOL_NAME, 'SMA Negeri 1 Srengat');
    await this.insertString(
      Settings.SCHOOL_ADDRESS,
      'Bagelenan, Srengat, Blitar',
    );
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'src',
      'assets',
      'sample_image.jpg',
    );
    const buffer = fs.readFileSync(filePath);
    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'sample_image.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer,
      size: buffer.length,
      destination: '',
      filename: 'sample_image.jpg',
      path: filePath,
      stream: fs.createReadStream(filePath),
    };

    await this.insertImage(Settings.SCHOOL_LOGO, file);
    console.log('School profile created');
  }

  async insertImage(key: Settings, value: Express.Multer.File) {
    const data = await this.schoolProfileRepository.getStringValue(key);
    if (!data) {
      const data = await this.imageService.processAndUpload([value]);
      this.schoolProfileRepository.saveNumberValue(key, data);
    }
  }

  async updateString(key: Settings, value: string) {
    return this.schoolProfileRepository.updateStringValue(key, value);
  }

  async insertString(key: Settings, value: string) {
    const data = await this.schoolProfileRepository.getStringValue(key);
    if (!data) {
      const cou = await this.schoolProfileRepository.saveStringValue(
        key,
        value,
      );
      return cou;
    }
    return data;
  }
}
