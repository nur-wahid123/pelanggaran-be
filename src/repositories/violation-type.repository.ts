import { Injectable } from '@nestjs/common';
import { ViolationTypeEntity } from 'src/entities/violation-type.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ViolationTypeRepository extends Repository<ViolationTypeEntity> {
  async saveViolationType(violationType: ViolationTypeEntity) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.save(violationType);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
    } finally {
      await queryRunner.release();
    }
  }
  constructor(private readonly datasource: DataSource) {
    super(ViolationTypeEntity, datasource.createEntityManager());
  }
}
