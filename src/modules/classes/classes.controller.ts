import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { JwtAuthGuard } from 'src/commons/guards/jwt-auth.guard';
import { Payload } from 'src/commons/decorators/payload.decorator';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { FilterDto } from 'src/commons/dto/filter.dto';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';

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
  findAll(@Query() query: FilterDto, @Query() pageOptionsDto: PageOptionsDto) {
    return this.classesService.findAll(query, pageOptionsDto);
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(+id);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
    @Payload() payload: JwtPayload,
  ) {
    return this.classesService.update(+id, updateClassDto, +payload.sub);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string, @Payload() payload: JwtPayload) {
    return this.classesService.remove(+id, +payload.sub);
  }
}
