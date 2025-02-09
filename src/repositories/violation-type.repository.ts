import { Injectable } from '@nestjs/common';
import { FilterDto } from 'src/commons/dto/filter.dto';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { ViolationTypeEntity } from 'src/entities/violation-type.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ViolationTypeRepository extends Repository<ViolationTypeEntity> {
  findAll(filter: FilterDto, pageOptionsDto: PageOptionsDto) {
    const { page, skip, take, order } = pageOptionsDto;
    const query = this.datasource
      .createQueryBuilder(ViolationTypeEntity, 'violationType')
      .leftJoinAndSelect('violationType.violations', 'violations')
      .where((qb) => {
        const { search } = filter;
        if (search) {
          qb.andWhere('violationType.name LIKE :search', {
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
    } finally {
      await queryRunner.release();
    }
  }
  constructor(private readonly datasource: DataSource) {
    super(ViolationTypeEntity, datasource.createEntityManager());
  }
}
