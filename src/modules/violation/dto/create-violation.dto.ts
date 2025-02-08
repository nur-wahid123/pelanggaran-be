import { Expose } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateViolationDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @Expose({ name: 'student_ids' })
  public studentIds?: number[];

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @Expose({ name: 'violation_type_ids' })
  public violationTypeIds?: number[];

  @IsOptional()
  @IsString()
  public note?: string;
}
