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
import { ViolationTypeService } from './violation-type.service';
import { CreateViolationTypeDto } from './dto/create-violation-type.dto';
import { UpdateViolationTypeDto } from './dto/update-violation-type.dto';
import { JwtAuthGuard } from 'src/commons/guards/jwt-auth.guard';
import { Payload } from 'src/commons/decorators/payload.decorator';
import { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('violation-type')
@UseGuards(JwtAuthGuard)
export class ViolationTypeController {
  constructor(private readonly violationTypeService: ViolationTypeService) {}

  @Post('create')
  create(
    @Body() createViolationTypeDto: CreateViolationTypeDto,
    @Payload() payload: JwtPayload,
  ) {
    return this.violationTypeService.create(
      +payload.sub,
      createViolationTypeDto,
    );
  }

  @Get('list')
  findAll() {
    return this.violationTypeService.findAll();
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string) {
    return this.violationTypeService.findOne(+id);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateViolationTypeDto: UpdateViolationTypeDto,
  ) {
    return this.violationTypeService.update(+id, updateViolationTypeDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.violationTypeService.remove(+id);
  }
}
