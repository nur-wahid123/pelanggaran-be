import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ViolationService } from './violation.service';
import { JwtAuthGuard } from 'src/commons/guards/jwt-auth.guard';
import { Payload } from 'src/commons/decorators/payload.decorator';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { CreateViolationDto } from './dto/create-violation.dto';

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
}
