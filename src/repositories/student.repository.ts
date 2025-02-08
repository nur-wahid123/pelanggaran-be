import { Injectable } from '@nestjs/common';
import { StudentEntity } from 'src/entities/student.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class StudentRepository extends Repository<StudentEntity> {
  async saveStudents(students: StudentEntity[]) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.save(students);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
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
    } finally {
      await queryRunner.release();
    }
  }
  constructor(private readonly datasource: DataSource) {
    super(StudentEntity, datasource.createEntityManager());
  }
}
