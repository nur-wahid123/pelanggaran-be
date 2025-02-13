import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FilterDto } from 'src/commons/dto/filter.dto';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { ClassEntity } from 'src/entities/class.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ClassRepository extends Repository<ClassEntity> {
  findAll(filter: FilterDto, pageOptionsDto: PageOptionsDto) {
    const { page, skip, take, order } = pageOptionsDto;
    const qB = this.datasource
      .createQueryBuilder(ClassEntity, 'class')
      .leftJoinAndSelect('class.students', 'students')
      .where((qb) => {
        const { search } = filter;
        if (search) {
          qb.andWhere('(lower(class.name) LIKE lower(:search))', {
            search: `%${search}%`,
          });
        }
      });

    if (page && take) {
      qB.skip(skip).take(take);
    }
    qB.orderBy('class.id', order);
    return qB.getManyAndCount();
  }

  async saveClass(newClass: ClassEntity) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.save(newClass);
      await queryRunner.commitTransaction();
      return newClass;  
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException('internal server error');
    } finally {
      await queryRunner.release();
    }
  }
  constructor(private readonly datasource: DataSource) {
    super(ClassEntity, datasource.createEntityManager());
  }
}
