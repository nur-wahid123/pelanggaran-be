import { Test, TestingModule } from '@nestjs/testing';
import { SchoolProfileController } from './school-profile.controller';
import { SchoolProfileService } from './school-profile.service';

describe('SchoolProfileController', () => {
  let controller: SchoolProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolProfileController],
      providers: [SchoolProfileService],
    }).compile();

    controller = module.get<SchoolProfileController>(SchoolProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
