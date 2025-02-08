import { Module } from '@nestjs/common';
import { ViolationTypeService } from './violation-type.service';
import { ViolationTypeController } from './violation-type.controller';
import { ViolationTypeRepository } from 'src/repositories/violation-type.repository';

@Module({
  controllers: [ViolationTypeController],
  providers: [ViolationTypeService, ViolationTypeRepository],
})
export class ViolationTypeModule {}
