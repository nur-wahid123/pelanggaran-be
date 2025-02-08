import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { JwtAuthGuard } from 'src/commons/guards/jwt-auth.guard';
import { Payload } from 'src/commons/decorators/payload.decorator';
import { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('classes')
@UseGuards(JwtAuthGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post('create')
  create(
    @Body() createClassDto: CreateClassDto,
    @Payload() payload: JwtPayload,
  ) {
    return this.classesService.create(+payload.sub, createClassDto);
  }

  @Get('list')
  findAll() {
    return this.classesService.findAll();
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(+id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classesService.update(+id, updateClassDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.classesService.remove(+id);
  }
}
