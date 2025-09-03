import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassRepository } from 'src/repositories/classes.repository';
import { ClassEntity } from 'src/entities/class.entity';
import { FilterDto } from 'src/commons/dto/filter.dto';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { PageMetaDto } from 'src/commons/dto/page-meta.dto';
import { PageDto } from 'src/commons/dto/page.dto';

@Injectable()
export class ClassesService {
  async findAll(query: FilterDto, pageOptionsDto: PageOptionsDto) {
    try {
      const [data, itemCount] = await this.classRepository.findAll(
        query,
        pageOptionsDto,
      );
      const meta = new PageMetaDto({ pageOptionsDto, itemCount });
      return new PageDto(data, meta);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('internal server error');
    }
  }
  async create(userId: number, createClassDto: CreateClassDto) {
    const { name } = createClassDto;
    const classes = await this.classRepository.findOne({ where: { name } });
    if (classes) {
      throw new BadRequestException(['the class already exists']);
    }
    const newClass = new ClassEntity();
    newClass.name = name;
    newClass.createdBy = userId;
    await this.classRepository.saveClass(newClass);
    return 'This action adds a new class';
  }

  constructor(private readonly classRepository: ClassRepository) {}

  async findOne(id: number) {
    const data = await this.classRepository.findOne({
      where: { id },
      relations: { students: true },
    });
    if (!data) {
      throw new NotFoundException('class not found');
    }
    return data;
  }

  async update(id: number, updateClassDto: UpdateClassDto, userId: number) {
    const { name } = updateClassDto;
    await this.findOne(id);
    const newDt = new ClassEntity();
    newDt.id = id;
    newDt.name = name;
    newDt.updatedBy = userId;
    return this.classRepository.saveClass(newDt);
  }

  async remove(id: number, userId: number) {
    const data = await this.findOne(id);
    if (!data) {
      throw new NotFoundException('class not found');
    }
    if (data.students.length > 0) {
      throw new BadRequestException('this class has students');
    }
    const newDt = new ClassEntity();
    newDt.id = id;
    newDt.deletedAt = new Date();
    newDt.deletedBy = userId;
    return this.classRepository.saveClass(newDt);
  }
}
