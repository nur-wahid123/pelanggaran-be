import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserLoginDto } from './dto/login-user.dto';
import { UserEntity } from 'src/entities/user.entity';
import { Token } from 'src/commons/types/token.type';
import { UserRepository } from 'src/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { UserRegisterDto } from './dto/register-user.dto';
import { RoleEnum } from 'src/commons/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  async init() {
    const user = await this.userRepository.findOne({
      where: { username: 'admin' },
    });
    if (user) {
      console.log('Superadmin created');
      return;
    }
    const registerDto = new UserRegisterDto();
    registerDto.name = 'Admin';
    registerDto.password = 'password123';
    registerDto.confirmPassword = 'password123';
    registerDto.email = 'admin@email.com';
    registerDto.role = RoleEnum.ADMIN;
    registerDto.username = 'admin';
    this.register(registerDto);
  }

  async login(dto: UserLoginDto): Promise<Token> {
    const { username } = dto;
    try {
      await this.userRepository.findUserByUsername(username);
      const payload = await this.userRepository.validateUser(dto);

      const token = await this.getToken(payload);
      return token;
    } catch (error) {
      console.log(error);
      throw error;
      throw new InternalServerErrorException('internal server error');
    }
  }

  async getToken(user: UserEntity): Promise<Token> {
    const payload = {
      username: user.username,
      name: user.name,
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.USER_KEY_SECRET,
      expiresIn: process.env.EXPIRY_TOKEN_TIME || '2h',
    });
    return { access_token: token };
  }

  async register(registerDto: UserRegisterDto): Promise<UserEntity> {
    const { username, confirmPassword, email, name, password, role } =
      registerDto;
    if (password !== confirmPassword) {
      throw new BadRequestException(
        'Password and Confirm Password are not same',
      );
    }

    const newUser = new UserEntity();
    try {
      await this.userRepository.checkUsernameAndEmailExistanceOnDB(
        username,
        email,
      );
    } catch (error) {
      console.log(error);
      console.log('user exists');
      return;
    }
    newUser.username = username;
    newUser.email = email;
    newUser.name = name;
    newUser.role = role;
    newUser.password = await this.userRepository.generatePassword(password);
    const user = await this.userRepository.saveUser(newUser);
    return user;
  }
}
