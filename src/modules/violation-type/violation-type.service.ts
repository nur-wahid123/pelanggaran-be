import { Injectable } from '@nestjs/common';
import { CreateViolationTypeDto } from './dto/create-violation-type.dto';
import { UpdateViolationTypeDto } from './dto/update-violation-type.dto';
import { ViolationTypeEntity } from 'src/entities/violation-type.entity';
import { ViolationTypeRepository } from 'src/repositories/violation-type.repository';

@Injectable()
export class ViolationTypeService {
  async create(userId: number, createViolationTypeDto: CreateViolationTypeDto) {
    const { name, point } = createViolationTypeDto;
    const violationType = new ViolationTypeEntity();
    violationType.name = name;
    violationType.createdBy = userId;
    violationType.point = point;
    await this.violationTypeRepository.saveViolationType(violationType);
    return violationType;
  }

  constructor(
    private readonly violationTypeRepository: ViolationTypeRepository,
  ) {}

  findAll() {
    return `This action returns all violationType`;
  }

  findOne(id: number) {
    return `This action returns a #${id} violationType`;
  }

  update(id: number, updateViolationTypeDto: UpdateViolationTypeDto) {
    return `This action updates a #${updateViolationTypeDto} violationType`;
  }

  remove(id: number) {
    return `This action removes a #${id} violationType`;
  }
}
