import { Injectable } from '@nestjs/common';
import { FilterDto } from 'src/commons/dto/filter.dto';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { ClassEntity } from 'src/entities/class.entity';
import { StudentEntity } from 'src/entities/student.entity';
import { CreateStudentBatchDto } from 'src/modules/student/dto/create-student.dto';
import { DataSource, In, Repository } from 'typeorm';

@Injectable()
export class StudentRepository extends Repository<StudentEntity> {
  findAllStudent(
    query: FilterDto,
    pageOptionsDto: PageOptionsDto,
  ): Promise<[StudentEntity[], number]> {
    const { search } = query;
    const { page, take, skip } = pageOptionsDto;
    const qb = this.createQueryBuilder('student')
      .leftJoinAndSelect('student.violations', 'violations')
      .leftJoinAndSelect('student.studentClass', 'studentClass')
      .where((qb) => {
        if (search) {
          qb.andWhere('lower(student.name) LIKE lower(:search)', {
            search: `%${search}%`,
          });
        }
      });

    if (page && take) {
      qb.skip(skip).take(take);
    }
    return qb.getManyAndCount();
  }

  async extractNisn(createStudentDto: CreateStudentBatchDto) {
    const { items } = createStudentDto;
    const nisns: string[] = [];
    for (let index = 0; index < items.length; index++) {
      const element = items[index];
      nisns.push(element.nisn);
    }
    const students = await this.find({
      where: { nationalStudentId: In(nisns) },
      select: { id: true, nationalStudentId: true },
    });
    return students;
  }

  async saveStudents(userId: number, createStudentDto: CreateStudentBatchDto) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const existsStudents = await this.extractNisn(createStudentDto);
      const { items } = createStudentDto;
      const students: StudentEntity[] = [];
      const classNames = Array.from(new Set(items.map((i) => i.className)));
      const classes = await queryRunner.manager.find(ClassEntity, {
        where: { name: In(classNames) },
      });
      const non_exists_classes_string = classNames.filter((c) => {
        return !classes.find((cl) => cl.name === c);
      });
      const non_exists_classes = non_exists_classes_string.map((c) => {
        const classEntity = new ClassEntity();
        classEntity.createdBy = userId;
        classEntity.name = c;
        return classEntity;
      });
      if (non_exists_classes.length > 0) {
        await queryRunner.manager.save(non_exists_classes);
      }
      for (let index = 0; index < items.length; index++) {
        const element = items[index];
        const { className, name, nis, nisn } = element;
        let student: StudentEntity = existsStudents.find((e) => {
          return e.nationalStudentId === nisn;
        });
        if (!student) {
          student = new StudentEntity();
        }
        let classEntity: ClassEntity;
        classEntity = classes.find((c) => c.name === className);
        if (!classEntity) {
          classEntity = non_exists_classes.find((c) => c.name === className);
        }
        student.studentClass = classEntity;
        student.createdBy = userId;
        student.name = name;
        student.nationalStudentId = nisn;
        student.schoolStudentId = nis;
        students.push(student);
      }
      await queryRunner.manager.save(students);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async saveStudent(student: StudentEntity) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.save(student);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  constructor(private readonly datasource: DataSource) {
    super(StudentEntity, datasource.createEntityManager());
  }
}
