import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FilterDto } from 'src/commons/dto/filter.dto';
import { PageMetaDto } from 'src/commons/dto/page-meta.dto';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { PageDto } from 'src/commons/dto/page.dto';
import { UserRepository } from 'src/repositories/user.repository';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserCreateDto } from './dto/user-create.dto';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class UserService {
  async remove(id: number, userId: number) {
    const user: UserEntity = await this.userRepository.findOne({
      where: { id },
      relations: { violations: true },
      select: {
        violations: { id: true },
        id: true,
        role: true,
      },
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    if (user.violations.length > 0) {
      throw new BadRequestException('this user has violations');
    }
    user.id = id;
    user.deletedBy = userId;
    user.deletedAt = new Date();
    try {
      return this.userRepository.saveUser(user);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('internal server error');
    }
  }
  async create(userCreateDto: UserCreateDto, userId: number) {
    try {
      await this.userRepository.checkUsernameAndEmailExistanceOnDB(
        userCreateDto.username,
        userCreateDto.email,
      );
    } catch (error) {
      console.log(error);
      throw new ForbiddenException('User already exist');
    }
    const userWithThisEmail: UserEntity = await this.userRepository.findOne({
      where: { email: userCreateDto.email },
      withDeleted: true,
    });
    let user: UserEntity = new UserEntity();
    if (userWithThisEmail) {
      user = userWithThisEmail;
      user.deletedAt = null;
      user.deletedBy = null;
    }
    user.name = userCreateDto.name;
    user.username = userCreateDto.username;
    user.role = userCreateDto.role;
    user.email = userCreateDto.email;
    const password = userCreateDto.password;
    const hashedPassword = await this.userRepository.generatePassword(password);
    user.password = hashedPassword;
    user.createdBy = userId;
    return this.userRepository.saveUser(user);
  }
  async update(id: number, userUpdateDto: UserUpdateDto, userId: number) {
    const user: UserEntity = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const userWithThisName: UserEntity[] = await this.userRepository.find({
      where: { username: userUpdateDto.username },
    });
    const userWithThisEmail: UserEntity[] = await this.userRepository.find({
      where: { email: userUpdateDto.email },
    });
    if (userWithThisEmail.length > 1 || userWithThisName.length > 1) {
      throw new BadRequestException(
        'User with This Name or Email already exist',
      );
    }
    user.name = userUpdateDto.name;
    user.username = userUpdateDto.username;
    user.role = userUpdateDto.role;
    user.email = userUpdateDto.email;
    user.updatedBy = userId;
    return this.userRepository.saveUser(user);
  }
  findOne(id: number) {
    return this.userRepository.findOne({
      where: { id },
      select: { id: true, email: true, name: true, username: true, role: true },
    });
  }
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(pageOptionsDto: PageOptionsDto, filter: FilterDto) {
    const [data, itemCount] = await this.userRepository.findAll(
      pageOptionsDto,
      filter,
    );

    const meta = new PageMetaDto({ pageOptionsDto, itemCount });

    return new PageDto(data, meta);
  }
}
