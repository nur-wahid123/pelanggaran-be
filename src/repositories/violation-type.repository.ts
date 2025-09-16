import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { ViolationTypeEntity } from 'src/entities/violation-type.entity';
import { CreateViolationTypeBatchDto } from 'src/modules/violation-type/dto/create-violation-type.dto';
import { QueryViolationTypeDto } from 'src/modules/violation-type/dto/query-violation-type.dto';
import { DataSource, In, Repository } from 'typeorm';

@Injectable()
export class ViolationTypeRepository extends Repository<ViolationTypeEntity> {
  async saveViolations(
    userId: number,
    createViolationTypeDto: CreateViolationTypeBatchDto,
  ) {
    const { items } = createViolationTypeDto;
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const names = Array.from(new Set(items.map((i) => i.name)));
      const exists = await queryRunner.manager.find(ViolationTypeEntity, {
        where: { name: In(names) },
      });
      const non_exists = names.filter((n) => {
        return !exists.find((e) => e.name === n);
      });
      const classes = items.filter((i) => non_exists.includes(i.name));
      await queryRunner.manager.save(
        classes.map((n) => {
          const data = new ViolationTypeEntity();
          data.name = n.name;
          data.createdBy = userId;
          data.point = n.point;
          return data;
        }),
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException('internal server error');
    } finally {
      await queryRunner.release();
    }
  }

  findAll(filter: QueryViolationTypeDto, pageOptionsDto: PageOptionsDto) {
    const { page, skip, take, order } = pageOptionsDto;
    const query = this.datasource
      .createQueryBuilder(ViolationTypeEntity, 'violationType')
      .leftJoin('violationType.violations', 'violations')
      .leftJoin('violations.students', 'students')
      .select([
        'violationType.id',
        'violationType.point',
        'violationType.name',
        'violations.id',
        'students.id',
      ])
      .where((qb) => {
        const { search, studentId, violationId } = filter;
        if (violationId) {
          qb.andWhere('violations.id = :violationId', { violationId });
        }
        if (studentId) {
          qb.andWhere('students.nationalStudentId = :studentId', { studentId });
        }
        if (search) {
          qb.andWhere('lower(violationType.name) LIKE lower(:search)', {
            search: `%${search}%`,
          });
        }
      });

    if (page && take) {
      query.skip(skip).take(take);
    }
    query.orderBy('violationType.id', order);
    return query.getManyAndCount();
  }
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
      throw new InternalServerErrorException('internal server error');
    } finally {
      await queryRunner.release();
    }
  }
  constructor(private readonly datasource: DataSource) {
    super(ViolationTypeEntity, datasource.createEntityManager());
  }
}
