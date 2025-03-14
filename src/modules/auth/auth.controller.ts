import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Token } from 'src/commons/types/token.type';
import { UserLoginDto } from './dto/login-user.dto';
import { JwtAuthGuard } from 'src/commons/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/commons/guards/permission.guard';
import { SetRole } from 'src/commons/decorators/role.decorator';
import { RoleEnum } from 'src/commons/enums/role.enum';
import { UserRegisterDto } from './dto/register-user.dto';
import { UserEntity } from 'src/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() req: UserLoginDto): Promise<Token> {
    return this.authService.login(req);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @SetRole(RoleEnum.ADMIN)
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() req: UserRegisterDto): Promise<UserEntity> {
    return this.authService.register(req);
  }
}
