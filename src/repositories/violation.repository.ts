import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { QueryDateRangeDto } from 'src/commons/dto/query-daterange.dto';
import { ViolationTypeEnum } from 'src/commons/enums/violation-type.enum';
import { ImageLinks } from 'src/entities/image-links.entity';
import { StudentEntity } from 'src/entities/student.entity';
import { ViolationTypeEntity } from 'src/entities/violation-type.entity';
import { ViolationEntity } from 'src/entities/violation.entity';
import { QueryViolationDto } from 'src/modules/violation/dto/query-violation.dto';
import { ViolationResponseDto } from 'src/modules/violation/dto/violent-response.dto';
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
  ): Promise<[any[], number]> {
    const { type } = filter;
    try {
      switch (type) {
        case ViolationTypeEnum.COLLECTION:
          return this.findAllViolationCollection(
            filter,
            pageOptionsDto,
            dateRange,
          );
        case ViolationTypeEnum.PER_STUDENT:
          return this.findAllViolationStudent(
            filter,
            pageOptionsDto,
            dateRange,
          );
        case ViolationTypeEnum.PER_VIOLATION_TYPE:
          return this.findAllViolationType(filter, pageOptionsDto, dateRange);
        default:
          throw new InternalServerErrorException('internal server error');
      }
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('internal server error');
    }
  }
  async findAllViolationCollection(
    filter: QueryViolationDto,
    pageOptionsDto: PageOptionsDto,
    dateRange: QueryDateRangeDto,
  ): Promise<[any[], number]> {
    const { search, studentId, violationTypeId } = filter;
    const { startDate, finishDate } = dateRange;
    const qB = this.datasource
      .createQueryBuilder(ViolationEntity, 'vi')
      .leftJoinAndSelect('vi.creator', 'creator')
      .leftJoinAndSelect('vi.students', 'student')
      .leftJoinAndSelect('vi.violationTypes', 'violationType')
      .addSelect(['violationType.name', 'violationType.point'])
      .addSelect(['student.name', 'student.nationalStudentId'])
      .addSelect(['vi.createdAt', 'vi.date'])
      .addSelect(['creator.name'])
      .where((qb) => {
        if (studentId) {
          qb.andWhere('student.nationalStudentId = :studentId', { studentId });
        }
        if (violationTypeId) {
          qb.andWhere('violationType.id = :violationTypeId', {
            violationTypeId,
          });
        }
        if (search) {
          qb.andWhere(
            '(lower(violationType.name) LIKE lower(:search) or lower(student.name) LIKE lower(:search) or lower(creator.name) LIKE lower(:search))',
            {
              search: `%${search}%`,
            },
          );
        }
        if (startDate && finishDate) {
          qb.andWhere(`vi.date BETWEEN '${startDate}' AND '${finishDate}'`);
        }
      });

    const { page, skip, take } = pageOptionsDto;
    if (page && take) {
      qB.skip(skip).take(take);
    }
    qB.orderBy('vi.id', 'DESC');
    const data = qB.getManyAndCount();
    const [violations, count] = await data;
    const imageGroupIds = violations.map((violation) => violation.imageGroupId);
    const imageGroups = await this.datasource
      .createQueryBuilder(ImageLinks, 'imageGroup')
      .where('imageGroup.id IN (:...imageGroupIds)', {
        imageGroupIds,
      })
      .select(['imageGroup.id', 'imageGroup.imageId'])
      .getMany();
    const dataNew = violations.map((violation) => {
      const imageGroup = imageGroups.find(
        (imageGroup) => imageGroup.id === violation.imageGroupId,
      );
      const res = new ViolationResponseDto(violation);
      if (imageGroup) {
        res.images = [imageGroup.imageId];
      }
      return res;
    });
    // violations.forEach((violation) => {
    return [dataNew, count];
  }
  findAllViolationType(
    filter: QueryViolationDto,
    pageOptionsDto: PageOptionsDto,
    dateRange: QueryDateRangeDto,
  ): Promise<[any[], number]> {
    const { search, studentId, violationTypeId } = filter;
    const { startDate, finishDate } = dateRange;
    const qB = this.datasource
      .createQueryBuilder(ViolationTypeEntity, 'violationTypes')
      .leftJoinAndSelect('violationTypes.violations', 'vi')
      .leftJoinAndSelect('vi.creator', 'creator')
      .leftJoinAndSelect('vi.students', 'student')
      .addSelect(['violationTypes.name', 'violationTypes.point'])
      .addSelect(['student.name', 'student.nationalStudentId'])
      .addSelect(['vi.createdAt'])
      .addSelect(['creator.name'])
      .where((qb) => {
        if (studentId) {
          qb.andWhere('student.nationalStudentId = :studentId', { studentId });
        }
        if (violationTypeId) {
          qb.andWhere('violationTypes.id = :violationTypeId', {
            violationTypeId,
          });
        }
        if (search) {
          qb.andWhere(
            '(lower(violationTypes.name) LIKE lower(:search) or lower(student.name) LIKE lower(:search) or lower(creator.name) LIKE lower(:search))',
            {
              search: `%${search}%`,
            },
          );
        }
        if (startDate && finishDate) {
          qb.andWhere(`vi.date BETWEEN '${startDate}' AND '${finishDate}'`);
        }
      });

    const { page, skip, take, order } = pageOptionsDto;
    if (page && take) {
      qB.skip(skip).take(take);
    }
    qB.orderBy('vi.id', order);
    return qB.getManyAndCount();
  }
  findAllViolationStudent(
    filter: QueryViolationDto,
    pageOptionsDto: PageOptionsDto,
    dateRange: QueryDateRangeDto,
  ): Promise<[any[], number]> {
    const { search, studentId, violationTypeId } = filter;
    const { startDate, finishDate } = dateRange;
    const qB = this.datasource
      .createQueryBuilder(StudentEntity, 'st')
      .leftJoinAndSelect('st.violations', 'vi')
      .leftJoinAndSelect('vi.creator', 'creator')
      .leftJoin('st.studentClass', 'studentClass')
      .leftJoinAndSelect('vi.violationTypes', 'violationTypes')
      .addSelect(['violationTypes.name', 'violationTypes.point'])
      .addSelect(['st.name', 'st.nationalStudentId'])
      .addSelect(['vi.createdAt'])
      .addSelect(['studentClass.name'])
      .addSelect(['creator.name'])
      .where((qb) => {
        if (studentId) {
          qb.andWhere('student.id = :studentId', { studentId });
        }
        if (violationTypeId) {
          qb.andWhere('violationType.id = :violationTypeId', {
            violationTypeId,
          });
        }
        if (search) {
          qb.andWhere(
            '(lower(violationTypes.name) LIKE lower(:search) or lower(st.name) LIKE lower(:search) or lower(creator.name) LIKE lower(:search))',
            {
              search: `%${search}%`,
            },
          );
        }
        if (startDate && finishDate) {
          qb.andWhere(`vi.date BETWEEN '${startDate}' AND '${finishDate}'`);
        }
      });

    const { page, skip, take } = pageOptionsDto;
    if (page && take) {
      qB.skip(skip).take(take);
    }
    qB.orderBy('vi.id', 'DESC');
    return qB.getManyAndCount();
  }

  async saveViolations(violations: ViolationEntity) {
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
