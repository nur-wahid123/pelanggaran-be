import { Injectable } from '@nestjs/common';
import { ViolationTypeEntity } from 'src/entities/violation-type.entity';
import { ViolationEntity } from 'src/entities/violation.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ViolationRepository extends Repository<ViolationEntity> {
  async saveViolations(violations: ViolationEntity[]) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.save(violations);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
    } finally {
      await queryRunner.release();
    }
  }
  async findViolations(violationTypeId: number[]) {
    const qb = this.datasource.createQueryBuilder(
      ViolationTypeEntity,
      'violationType',
    );
    qb.where('violationType.id IN (:...ids)', { ids: violationTypeId });
    return qb.getMany();
  }
  constructor(private readonly datasource: DataSource) {
    super(ViolationEntity, datasource.createEntityManager());
  }
}
