import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FilterDto } from 'src/commons/dto/filter.dto';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { ViolationTypeEntity } from 'src/entities/violation-type.entity';
import { ViolationEntity } from 'src/entities/violation.entity';
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
    filter: FilterDto,
    pageOptionsDto: PageOptionsDto,
  ): [ViolationEntity[], number] | PromiseLike<[ViolationEntity[], number]> {
    const { page, skip, take, order } = pageOptionsDto;
    const qB = this.datasource
      .createQueryBuilder(ViolationEntity, 'violation')
      .leftJoinAndSelect('violation.creator', 'creator')
      .leftJoinAndSelect('violation.student', 'student')
      .leftJoinAndSelect('violation.violationTypes', 'violationTypes')
      .where((qb) => {
        const { search } = filter;
        if (search) {
          qb.andWhere(
            '(lower(violationTypes.name) LIKE lower(:search) or lower(student.name) LIKE lower(:search) or lower(creator.name) LIKE lower(:search))',
            {
              search: `%${search}%`,
            },
          );
        }
      });

    if (page && take) {
      qB.skip(skip).take(take);
    }
    qB.orderBy('violation.id', order);
    return qB.getManyAndCount();
  }
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
