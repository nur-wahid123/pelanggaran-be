import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateViolationTypeDto {
  @IsNotEmpty()
  @IsString()
  public name?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  public point?: number;
}
