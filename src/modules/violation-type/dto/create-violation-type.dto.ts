import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateViolationTypeDto {
  @IsNotEmpty()
  @IsString()
  public name?: string;

  @IsNotEmpty()
  @IsNumber()
  public point?: number;
}
