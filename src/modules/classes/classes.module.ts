import { Module } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { ClassRepository } from 'src/repositories/classes.repository';

@Module({
  controllers: [ClassesController],
  providers: [ClassesService, ClassRepository],
})
export class ClassesModule {}
