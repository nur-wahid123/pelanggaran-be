import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateViolationDto } from './dto/create-violation.dto';
import { ViolationRepository } from 'src/repositories/violation.repository';
import { UserEntity } from 'src/entities/user.entity';
import { StudentEntity } from 'src/entities/student.entity';
import { ViolationEntity } from 'src/entities/violation.entity';
import { In } from 'typeorm';

@Injectable()
export class ViolationService {
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
      violation.createdBy = user.id;
      violations.push(violation);
    }
    return this.violationRepository.saveViolations(violations);
  }
}
