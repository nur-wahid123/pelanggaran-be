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
import { ViolationTypeService } from './violation-type.service';
import {
  CreateViolationTypeBatchDto,
  CreateViolationTypeDto,
} from './dto/create-violation-type.dto';
import { UpdateViolationTypeDto } from './dto/update-violation-type.dto';
import { JwtAuthGuard } from 'src/commons/guards/jwt-auth.guard';
import { Payload } from 'src/commons/decorators/payload.decorator';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { FilterDto } from 'src/commons/dto/filter.dto';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';

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

  @Post('create-batch')
  createBatch(
    @Body() createViolationTypeDto: CreateViolationTypeBatchDto,
    @Payload() payload: JwtPayload,
  ) {
    return this.violationTypeService.createBatch(
      +payload.sub,
      createViolationTypeDto,
    );
  }

  @Get('list')
  findAll(@Query() query: FilterDto, @Query() pageOptionsDto: PageOptionsDto) {
    return this.violationTypeService.findAll(query, pageOptionsDto);
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string) {
    return this.violationTypeService.findOne(+id);
  }

  @Patch('update/:id')
  update(
    @Payload() payload: JwtPayload,
    @Param('id') id: string,
    @Body() updateViolationTypeDto: UpdateViolationTypeDto,
  ) {
    return this.violationTypeService.update(
      +id,
      updateViolationTypeDto,
      +payload.sub,
    );
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string, @Payload() payload: JwtPayload) {
    return this.violationTypeService.remove(+id, +payload.sub);
  }
}
