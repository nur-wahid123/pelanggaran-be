import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { RoleEnum } from 'src/commons/enums/role.enum';

export class UserCreateDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 1,
    minSymbols: 0,
  })
  password: string;

  @IsEnum(RoleEnum)
  role: RoleEnum;
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
