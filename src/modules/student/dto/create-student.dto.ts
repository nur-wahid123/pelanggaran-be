import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  public name?: string;

  @IsNotEmpty()
  @IsString()
  public nisn?: string;

  @IsNotEmpty()
  @IsString()
  public nis?: string;

  @IsNotEmpty()
  @IsNumber()
  @Expose({ name: 'class_id' })
  public classId?: number;
}

export class CreateStudentBatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStudentDto)
  public items?: CreateStudentDto[];
}
