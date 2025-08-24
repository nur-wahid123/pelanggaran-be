import {
  Body,
  Controller,
  Get,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SchoolProfileService } from './school-profile.service';
import { Settings } from 'src/commons/enums/settings.enum';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('school-profile')
export class SchoolProfileController {
  constructor(private readonly schoolProfileService: SchoolProfileService) {}

  @Get('school-logo')
  async getSchoolLogo() {
    return this.schoolProfileService.getSchoolLogo();
  }

  @Get('school-name')
  async getSchoolName() {
    return this.schoolProfileService.getSchoolName();
  }

  @Get('school-address')
  async getSchoolAddress() {
    return this.schoolProfileService.getSchoolAddress();
  }

  @Put('school-logo/edit')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  async editSchoolLogo(@UploadedFile('file') file: Express.Multer.File) {
    return this.schoolProfileService.updateLogo(Settings.SCHOOL_LOGO, file);
  }

  @Put('school-name/edit')
  async editSchoolName(@Body('name') name: string) {
    return this.schoolProfileService.updateString(Settings.SCHOOL_NAME, name);
  }

  @Put('school-address/edit')
  async editSchoolAddress(@Body('name') name: string) {
    return this.schoolProfileService.updateString(
      Settings.SCHOOL_ADDRESS,
      name,
    );
  }
}
