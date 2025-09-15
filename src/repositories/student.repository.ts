import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FilterDto } from 'src/commons/dto/filter.dto';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { ClassEntity } from 'src/entities/class.entity';
import { StudentEntity } from 'src/entities/student.entity';
import { ViolationEntity } from 'src/entities/violation.entity';
import { CreateStudentBatchDto } from 'src/modules/student/dto/create-student.dto';
import { StudentResponse } from 'src/modules/student/dto/student-response.dto';
import { DataSource, In, Repository } from 'typeorm';

@Injectable()
export class StudentRepository extends Repository<StudentEntity> {
  async findAllStudent(
    query: FilterDto,
    pageOptionsDto: PageOptionsDto,
  ): Promise<[StudentResponse[], number]> {
    const { search } = query;
    const { page, take, skip } = pageOptionsDto;

    const qb = this.createQueryBuilder('student')
      .leftJoin('student.studentClass', 'studentClass')
      .leftJoin('student.violations', 'violations')
      .select([
        'student.id',
        'student.name',
        'student.nationalStudentId',
        'student.schoolStudentId',
        'studentClass.id',
        'studentClass.name',
        'violations.id',
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select('COALESCE(SUM(violation_type.point), 0)', 'totalPoints')
          .from('violations', 'v')
          .leftJoin(
            'violations_violation_types_violation_types',
            'vvt',
            'vvt.violations_id = v.id',
          )
          .leftJoin(
            'violation_types',
            'violation_type',
            'violation_type.id = vvt.violation_types_id AND violation_type.deleted_at IS NULL',
          )
          .leftJoin(
            'violations_students_students',
            'vss',
            'vss.violations_id = v.id',
          )
          .where('vss.students_id = student.id')
          .andWhere('v.deleted_at IS NULL');
      }, 'student_totalPoints')
      .where('student.deleted_at IS NULL');

    if (search) {
      qb.andWhere('LOWER(student.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    qb.orderBy('"student_totalPoints"', 'DESC');
    qb.addOrderBy('student.id', 'ASC');

    if (page && take) {
      qb.skip(skip).take(take);
    }

    // Group by necessary fields to prevent duplicates
    qb.groupBy('student.id')
      .addGroupBy('student.name')
      .addGroupBy('student.nationalStudentId')
      .addGroupBy('student.schoolStudentId')
      .addGroupBy('studentClass.id')
      .addGroupBy('violations.id')
      .addGroupBy('studentClass.name');

    const rawData = await qb.getRawMany();

    // Map to store unique students by id
    const studentMap = new Map<number, StudentResponse>();

    for (const row of rawData) {
      const studentId = row['student_id'];
      if (!studentMap.has(studentId)) {
        // Create a new student entity object
        const student = new StudentResponse();
        student.id = row['student_id'];
        student.name = row['student_name'];
        student.schoolStudentId = row['student_school_student_id'];
        student.nationalStudentId = row['student_national_student_id'];
        const studentClass = new ClassEntity();
        studentClass.id = row['studentClass_id'];
        studentClass.name = row['studentClass_name'];
        student.studentClass = studentClass;
        student.totalPoints = row['student_totalPoints'];
        student.violations = [];
        studentMap.set(studentId, student);
      }
      // If there is a violation, add it to the violations array (avoid duplicates)
      if (row['violations_id']) {
        const student = studentMap.get(studentId);
        if (
          !student.violations.some((v: any) => v.id === row['violations_id'])
        ) {
          const violations = student.violations;
          const violation = new ViolationEntity();
          violation.id = row['violations_id'];
          violations.push(violation);
          student.violations = violations;
        }
      }
    }

    const students = Array.from(studentMap.values());
    const count = students.length;

    return [students, count];
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
      throw new InternalServerErrorException('internal server error');
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
      throw new InternalServerErrorException('internal server error');
    } finally {
      await queryRunner.release();
    }
  }
  constructor(private readonly datasource: DataSource) {
    super(StudentEntity, datasource.createEntityManager());
  }
}
