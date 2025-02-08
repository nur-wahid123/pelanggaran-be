import { Module } from '@nestjs/common';
import { ViolationService } from './violation.service';
import { ViolationController } from './violation.controller';
import { ViolationRepository } from 'src/repositories/violation.repository';

@Module({
  controllers: [ViolationController],
  providers: [ViolationService, ViolationRepository],
})
export class ViolationModule {}
