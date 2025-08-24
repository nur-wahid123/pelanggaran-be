import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Settings } from 'src/commons/enums/settings.enum';
import { SchoolProfileEntity } from 'src/entities/school-profile.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class SchoolProfileRepository extends Repository<SchoolProfileEntity> {
  constructor(private readonly datasource: DataSource) {
    super(SchoolProfileEntity, datasource.createEntityManager());
  }

  async saveSchoolProfile(profile: SchoolProfileEntity) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.save(profile);
      await queryRunner.commitTransaction();
      return profile;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException('internal server error');
    } finally {
      await queryRunner.release();
    }
  }

  saveStringValue(key: Settings, value: string) {
    const data = new SchoolProfileEntity();
    data.name = key;
    data.value = value;
    return this.saveSchoolProfile(data);
  }

  async getStringValue(key: Settings): Promise<string | null> {
    const data = await this.findOneBy({ name: key });
    if (!data) return null;
    return data.value;
  }

  async updateStringValue(key: Settings, value: string) {
    const data = await this.findOne({ where: { name: key } });
    if (!data) throw new NotFoundException('Data not found');
    data.value = value;
    return this.saveSchoolProfile(data);
  }

  deleteStringValue(key: Settings) {
    return this.delete({ name: key });
  }

  saveBooleanValue(key: Settings, value: boolean) {
    return this.save({ name: key, value: value.toString() });
  }

  getBooleanValue(key: Settings): Promise<boolean> {
    return this.findOneBy({ name: key }).then((v) => v.value === 'true');
  }

  updateBooleanValue(key: Settings, value: boolean) {
    return this.updateStringValue(key, value.toString());
  }

  deleteBooleanValue(key: Settings) {
    return this.deleteStringValue(key);
  }

  saveNumberValue(key: Settings, value: number) {
    const data = new SchoolProfileEntity();
    data.name = key;
    data.value = value.toString();
    return this.saveSchoolProfile(data);
  }

  getNumberValue(key: Settings): Promise<number> {
    return this.findOneBy({ name: key }).then((v) => parseInt(v.value));
  }

  async updateNumberValue(key: Settings, value: number) {
    const data = await this.findOne({ where: { name: key } });
    if (!data) throw new NotFoundException('Data not found');
    data.value = value.toString();
    return this.updateStringValue(key, value.toString());
  }

  deleteNumberValue(key: Settings) {
    return this.deleteStringValue(key);
  }
}
