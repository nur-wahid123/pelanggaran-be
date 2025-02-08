import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassRepository } from 'src/repositories/classes.repository';
import { ClassEntity } from 'src/entities/class.entity';

@Injectable()
export class ClassesService {
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

  findAll() {
    return `This action returns all classes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} class`;
  }

  update(id: number, updateClassDto: UpdateClassDto) {
    return `This action updates a #${updateClassDto} class`;
  }

  remove(id: number) {
    return `This action removes a #${id} class`;
  }
}
