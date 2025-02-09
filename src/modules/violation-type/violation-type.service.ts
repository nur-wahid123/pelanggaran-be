import { Injectable } from '@nestjs/common';
import { CreateViolationTypeDto } from './dto/create-violation-type.dto';
import { UpdateViolationTypeDto } from './dto/update-violation-type.dto';
import { ViolationTypeEntity } from 'src/entities/violation-type.entity';
import { ViolationTypeRepository } from 'src/repositories/violation-type.repository';
import { FilterDto } from 'src/commons/dto/filter.dto';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { PageMetaDto } from 'src/commons/dto/page-meta.dto';
import { PageDto } from 'src/commons/dto/page.dto';

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

  async findAll(filter: FilterDto, pageOptionsDto: PageOptionsDto) {
    const [data, itemCount] = await this.violationTypeRepository.findAll(
      filter,
      pageOptionsDto,
    );

    const meta = new PageMetaDto({ pageOptionsDto, itemCount });

    return new PageDto(data, meta);
  }

  findOne(id: number) {
    return this.violationTypeRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateViolationTypeDto: UpdateViolationTypeDto,
    userId: number,
  ) {
    const violationType = new ViolationTypeEntity();
    violationType.id = id;
    violationType.updatedBy = userId;
    violationType.name = updateViolationTypeDto.name;
    violationType.point = updateViolationTypeDto.point;
    await this.violationTypeRepository.saveViolationType(violationType);
    return violationType;
  }

  async remove(id: number, userId: number) {
    const violationType = new ViolationTypeEntity();
    violationType.id = id;
    violationType.deletedBy = userId;
    violationType.deletedAt = new Date();
    await this.violationTypeRepository.saveViolationType(violationType);
    return violationType;
  }
}
