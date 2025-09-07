import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { QueryDateRangeDto } from 'src/commons/dto/query-daterange.dto';
import { ViolationTypeEnum } from 'src/commons/enums/violation-type.enum';
import { ImageLinks } from 'src/entities/image-links.entity';
import { StudentEntity } from 'src/entities/student.entity';
import { UserEntity } from 'src/entities/user.entity';
import { ViolationTypeEntity } from 'src/entities/violation-type.entity';
import { ViolationEntity } from 'src/entities/violation.entity';
import { QueryViolationDto } from 'src/modules/violation/dto/query-violation.dto';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ViolationRepository extends Repository<ViolationEntity> {
  async createViolation(
    students: StudentEntity[],
    violationTypes: ViolationTypeEntity[],
    image: number,
    user: UserEntity,
    note: string,
  ) {
    const qR = this.datasource.createQueryRunner();
    try {
      await qR.connect();
      await qR.startTransaction();
      const imageLink = await qR.manager.findOne(ImageLinks, {
        where: { id: image },
      });
      if (!imageLink) {
        throw new NotFoundException('image not found');
      }
      const violation = new ViolationEntity();
      violation.creator = user;
      if (note) {
        violation.note = note;
      }
      violation.image = imageLink;
      imageLink.violation = violation;
      violation.date = new Date();
      violation.students = students;
      violation.violationTypes = violationTypes;
      violation.createdBy = user.id;
      await qR.manager.save(imageLink);
      await qR.manager.save(violation);
      await qR.commitTransaction();
      return violation;
    } catch (error) {
      console.log(error);
      await qR.rollbackTransaction();
      throw new InternalServerErrorException('internal server error');
    } finally {
      await qR.release();
    }
  }
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
      .leftJoinAndSelect('vi.image', 'image')
      .leftJoinAndSelect('image.images', 'images')
      .addSelect(['violationType.name', 'violationType.point'])
      .addSelect(['student.name', 'student.nationalStudentId'])
      .addSelect(['image.id', 'images.id', 'images.key'])
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
    return qB.getManyAndCount();
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
      return violations;
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
