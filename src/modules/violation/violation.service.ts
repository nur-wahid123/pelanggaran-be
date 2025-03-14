import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateViolationDto } from './dto/create-violation.dto';
import { ViolationRepository } from 'src/repositories/violation.repository';
import { UserEntity } from 'src/entities/user.entity';
import { StudentEntity } from 'src/entities/student.entity';
import { ViolationEntity } from 'src/entities/violation.entity';
import { In } from 'typeorm';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { PageMetaDto } from 'src/commons/dto/page-meta.dto';
import { PageDto } from 'src/commons/dto/page.dto';
import { QueryDateRangeDto } from 'src/commons/dto/query-daterange.dto';
import { QueryViolationDto } from './dto/query-violation.dto';

@Injectable()
export class ViolationService {
  async remove(id: number, userId: number) {
    const violation = await this.violationRepository.findOne({
      where: { id },
    });
    if (!violation) {
      throw new NotFoundException('violation not found');
    }
    violation.deletedBy = userId;
    violation.deletedAt = new Date();
    return this.violationRepository.saveViolation(violation);
  }
  /**
   * Finds a single violation by id
   * @param id the violation id to find
   * @throws {NotFoundException} if no violation is found
   * @returns the found violation
   */
  findOne(id: number) {
    return this.violationRepository.findOne({
      where: { id },
      relations: { violationTypes: true, creator: true, student: true },
    });
  }
  async findAll(
    query: QueryViolationDto,
    pageOptionsDto: PageOptionsDto,
    dateRange: QueryDateRangeDto,
  ) {
    const [data, itemCount] = await this.violationRepository.findAll(
      query,
      pageOptionsDto,
      dateRange,
    );
    const meta = new PageMetaDto({ pageOptionsDto, itemCount });
    return new PageDto(data, meta);
  }
  constructor(private readonly violationRepository: ViolationRepository) {}

  async createViolation(userId: number, body: CreateViolationDto) {
    const { note, studentIds, violationTypeIds } = body;
    const user = await this.violationRepository.manager.findOne(UserEntity, {
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const students = await this.violationRepository.manager.findBy(
      StudentEntity,
      { id: In(studentIds) },
    );
    if (students.length === 0) {
      throw new NotFoundException('student not found');
    }
    const violationTypes =
      await this.violationRepository.findViolations(violationTypeIds);
    if (violationTypes.length === 0) {
      throw new NotFoundException('student not found');
    }
    const violations: ViolationEntity[] = [];
    for (let index = 0; index < students.length; index++) {
      const student = students[index];
      const violation = new ViolationEntity();
      violation.creator = user;
      violation.student = student;
      if (note) {
        violation.note = note;
      }
      violation.violationTypes = violationTypes;
      violation.date = new Date();
      violation.createdBy = user.id;
      violations.push(violation);
    }
    return this.violationRepository.saveViolations(violations);
  }
}
