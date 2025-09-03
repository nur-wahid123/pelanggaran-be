import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async findOne(id: string) {
    const data = await this.studentRepository.findOne({
      where: { nationalStudentId: id },
      relations: { studentClass: true },
    });
    if (!data) {
      throw new NotFoundException('student not found');
    }
    return data;
  }

  update(id: number, updateStudentDto: UpdateStudentDto) {
    return `This action updates a #${updateStudentDto} student`;
  }

  async remove(id: string, userId: number) {
    const data = await this.studentRepository.findOne({
      where: { nationalStudentId: id },
      relations: { studentClass: true, violations: true },
      select: {
        id: true,
        deletedBy: true,
        deletedAt: true,
        violations: { id: true },
      },
    });
    if (data.violations.length > 0) {
      throw new BadRequestException('this student has violations');
    }
    if (!data) {
      throw new NotFoundException('student not found');
    }
    data.deletedAt = new Date();
    data.deletedBy = userId;
    return this.studentRepository.saveStudent(data);
  }
}
