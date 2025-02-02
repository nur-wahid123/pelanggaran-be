import { Controller } from '@nestjs/common';
import { ViolationService } from './violation.service';

@Controller('violation')
export class ViolationController {
  constructor(private readonly violationService: ViolationService) {}
}
