import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateStudentBatchDto,
  CreateStudentDto,
} from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentEntity } from 'src/entities/student.entity';
import { StudentRepository } from 'src/repositories/student.repository';
import { ClassEntity } from 'src/entities/class.entity';
import { FilterDto } from 'src/commons/dto/filter.dto';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { PageMetaDto } from 'src/commons/dto/page-meta.dto';
import { PageDto } from 'src/commons/dto/page.dto';

@Injectable()
export class StudentService {
  async findAll(query: FilterDto, pageOptionsDto: PageOptionsDto) {
    const [data, itemCount] = await this.studentRepository.findAllStudent(
      query,
      pageOptionsDto,
    );

    const meta = new PageMetaDto({ pageOptionsDto, itemCount });

    return new PageDto(data, meta);
  }

  async createBatch(userId: number, createStudentDto: CreateStudentBatchDto) {
    return this.studentRepository.saveStudents(userId, createStudentDto);
  }

  constructor(private readonly studentRepository: StudentRepository) {}

  async create(userId: number, createStudentDto: CreateStudentDto) {
    const { className, name, nis, nisn } = createStudentDto;
    let student: StudentEntity = await this.studentRepository.findOne({
      where: { nationalStudentId: nisn },
    });
    if (!student) {
      student = new StudentEntity();
    }
    const classEntity = await this.studentRepository.manager.findOne(
      ClassEntity,
      { where: { name: className } },
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
