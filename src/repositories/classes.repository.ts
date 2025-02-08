import { Injectable } from '@nestjs/common';
import { ClassEntity } from 'src/entities/class.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ClassRepository extends Repository<ClassEntity> {
  async saveClass(newClass: ClassEntity) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.save(newClass);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
    } finally {
      await queryRunner.release();
    }
  }
  constructor(private readonly datasource: DataSource) {
    super(ClassEntity, datasource.createEntityManager());
  }
}
