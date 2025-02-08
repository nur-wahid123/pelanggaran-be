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
import { StudentService } from './student.service';
import {
  CreateStudentBatchDto,
  CreateStudentDto,
} from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from 'src/commons/guards/jwt-auth.guard';
import { Payload } from 'src/commons/decorators/payload.decorator';
import { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('create')
  create(
    @Body() createStudentDto: CreateStudentDto,
    @Payload() payload: JwtPayload,
  ) {
    return this.studentService.create(+payload.sub, createStudentDto);
  }

  @Post('create-batch')
  createBatch(
    @Body() createStudentDto: CreateStudentBatchDto,
    @Payload() payload: JwtPayload,
  ) {
    return this.studentService.createBatch(+payload.sub, createStudentDto);
  }

  @Get('list')
  findAll() {
    return this.studentService.findAll();
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(+id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentService.update(+id, updateStudentDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.studentService.remove(+id);
  }
}
