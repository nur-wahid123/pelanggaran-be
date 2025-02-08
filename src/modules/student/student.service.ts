import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateStudentBatchDto,
  CreateStudentDto,
} from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentEntity } from 'src/entities/student.entity';
import { StudentRepository } from 'src/repositories/student.repository';
import { ClassEntity } from 'src/entities/class.entity';
import { In } from 'typeorm';

@Injectable()
export class StudentService {
  async createBatch(userId: number, createStudentDto: CreateStudentBatchDto) {
    const existsStudents = await this.extractNisn(createStudentDto);
    const { items } = createStudentDto;
    const students: StudentEntity[] = [];
    for (let index = 0; index < items.length; index++) {
      const element = items[index];
      const { classId, name, nis, nisn } = element;
      let student: StudentEntity = existsStudents.find((e) => {
        return e.nationalStudentId === nisn;
      });
      if (!student) {
        student = new StudentEntity();
      }
      const classEntity = await this.studentRepository.manager.findOne(
        ClassEntity,
        { where: { id: classId } },
      );
      if (!classEntity) {
        throw new NotFoundException('class not found');
      }
      student.studentClass = classEntity;
      student.createdBy = userId;
      student.name = name;
      student.nationalStudentId = nisn;
      student.schoolStudentId = nis;
      students.push(student);
    }
    await this.studentRepository.saveStudents(students);
    return 'Success';
  }
  async extractNisn(createStudentDto: CreateStudentBatchDto) {
    const { items } = createStudentDto;
    const nisns: string[] = [];
    for (let index = 0; index < items.length; index++) {
      const element = items[index];
      nisns.push(element.nisn);
    }
    const students = await this.studentRepository.find({
      where: { nationalStudentId: In(nisns) },
      select: { id: true, nationalStudentId: true },
    });
    return students;
  }

  constructor(private readonly studentRepository: StudentRepository) {}

  async create(userId: number, createStudentDto: CreateStudentDto) {
    const { classId, name, nis, nisn } = createStudentDto;
    let student: StudentEntity = await this.studentRepository.findOne({
      where: { nationalStudentId: nisn },
    });
    if (!student) {
      student = new StudentEntity();
    }
    const classEntity = await this.studentRepository.manager.findOne(
      ClassEntity,
      { where: { id: classId } },
    );
    if (!classEntity) {
      throw new NotFoundException('class not found');
    }
    student.studentClass = classEntity;
    student.createdBy = userId;
    student.name = name;
    student.nationalStudentId = nisn;
    student.schoolStudentId = nis;
    await this.studentRepository.saveStudent(student);
    return student;
  }

  findAll() {
    return `This action returns all student`;
  }

  findOne(id: number) {
    return `This action returns a #${id} student`;
  }

  update(id: number, updateStudentDto: UpdateStudentDto) {
    return `This action updates a #${updateStudentDto} student`;
  }

  remove(id: number) {
    return `This action removes a #${id} student`;
  }
}
