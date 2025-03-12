import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { QueryDateRangeDto } from 'src/commons/dto/query-daterange.dto';
import { ViolationTypeEnum } from 'src/commons/enums/violation-type.enum';
import { ViolationCollectionEntity } from 'src/entities/violation-collection.entity';
import { ViolationTypeEntity } from 'src/entities/violation-type.entity';
import { ViolationEntity } from 'src/entities/violation.entity';
import { QueryViolationDto } from 'src/modules/violation/dto/query-violation.dto';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ViolationRepository extends Repository<ViolationEntity> {
  async saveViolation(violation: ViolationEntity) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.save(violation);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException('internal server error');
    } finally {
      await queryRunner.release();
    }
  }

  findAll(
    filter: QueryViolationDto,
    pageOptionsDto: PageOptionsDto,
    dateRange: QueryDateRangeDto,
  ): [any[], number] {
    const { startDate, finishDate } = dateRange;
    const { page, skip, take, order } = pageOptionsDto;
    const { search, type } = filter;
    switch (type) {
      case ViolationTypeEnum.COLLECTION:

    }
    const qB = this.datasource
      .createQueryBuilder(ViolationCollectionEntity, 'violationCollection')
      .leftJoinAndSelect('violationCollection.violations', 'violations')
      .leftJoinAndSelect('violations.creator', 'creator')
      .leftJoinAndSelect('violations.student', 'student')
      .leftJoinAndSelect('violations.violationTypes', 'violationTypes')
      .where((qb) => {
        if (search) {
          qb.andWhere(
            '(lower(violationTypes.name) LIKE lower(:search) or lower(student.name) LIKE lower(:search) or lower(creator.name) LIKE lower(:search))',
            {
              search: `%${search}%`,
            },
          );
        }
        if (startDate && finishDate) {
          qb.andWhere(
            `violations.createdAt BETWEEN '${startDate}' AND '${finishDate}'`,
          );
        }
      });

    if (page && take) {
      qB.skip(skip).take(take);
    }
    qB.orderBy('violations.id', order);
    return qB.getManyAndCount();
  }
  async saveViolations(violations: ViolationEntity[]) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const violationCollection = new ViolationCollectionEntity();
      await queryRunner.manager.save(violationCollection);
      for (let index = 0; index < violations.length; index++) {
        const violation = violations[index];
        violation.violationCollection = violationCollection;
      }
      await queryRunner.manager.save(violations);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException('internal server error');
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
