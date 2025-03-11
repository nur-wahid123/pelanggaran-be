import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  // Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ViolationService } from './violation.service';
import { JwtAuthGuard } from 'src/commons/guards/jwt-auth.guard';
import { Payload } from 'src/commons/decorators/payload.decorator';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { CreateViolationDto } from './dto/create-violation.dto';
import { FilterDto } from 'src/commons/dto/filter.dto';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { SetRole } from 'src/commons/decorators/role.decorator';
import { RoleEnum } from 'src/commons/enums/role.enum';
import { QueryDateRangeDto } from 'src/commons/dto/query-daterange.dto';

@Controller('violation')
@UseGuards(JwtAuthGuard)
export class ViolationController {
  constructor(private readonly violationService: ViolationService) {}

  @Post('create')
  createVioation(
    @Payload() payload: JwtPayload,
    @Body() body: CreateViolationDto,
  ) {
    return this.violationService.createViolation(+payload.sub, body);
  }

  @Get('list')
  findAll(
    @Query() query: FilterDto,
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() dateRange: QueryDateRangeDto,
  ) {
    return this.violationService.findAll(query, pageOptionsDto, dateRange);
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string) {
    return this.violationService.findOne(+id);
  }

  // @Patch('update/:id')
  // update(
  //   @Payload() payload: JwtPayload,
  //   @Param('id') id: string,
  //   @Body() updateViolationTypeDto: UpdateViolationDto,
  // ) {
  //   return this.violationService.update(
  //     +id,
  //     updateViolationTypeDto,
  //     +payload.sub,
  //   );
  // }

  @Delete('delete/:id')
  @SetRole(RoleEnum.ADMIN)
  remove(@Param('id') id: string, @Payload() payload: JwtPayload) {
    return this.violationService.remove(+id, +payload.sub);
  }
}
