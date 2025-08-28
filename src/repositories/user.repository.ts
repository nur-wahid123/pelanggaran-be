import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FilterDto } from 'src/commons/dto/filter.dto';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import HashPassword from 'src/commons/utils/hash-password.util';
import { UserEntity } from 'src/entities/user.entity';
import { UserLoginDto } from 'src/modules/auth/dto/login-user.dto';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  findAll(pageOptionsDto: PageOptionsDto, filter: FilterDto) {
    const { page, skip, take, order } = pageOptionsDto;
    const qB = this.createQueryBuilder('user')
      .where((qb) => {
        const { search } = filter;
        if (search) {
          qb.andWhere('(lower(user.username) LIKE lower(:search))', {
            search: `%${search}%`,
          });
        }
      })
      .orderBy('user.id', order);
    if (page && take) {
      qB.skip(skip).take(take);
    }
    return qB.getManyAndCount();
  }
  async saveUser(newUser: UserEntity): Promise<UserEntity> {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.save(newUser);
      await queryRunner.commitTransaction();
      return newUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException('internal server error');
    } finally {
      await queryRunner.release();
    }
  }
  generatePassword(password: string): string | PromiseLike<string> {
    const passwordHash = this.hashPassword.generate(password);
    return passwordHash;
  }
  async checkUsernameAndEmailExistanceOnDB(username: string, email: string) {
    const user = await this.findOne({
      where: [{ username }, { email }],
    });
    if (user) {
      throw new ForbiddenException('User already exist');
    }
  }

  constructor(
    private readonly datasource: DataSource,
    private readonly hashPassword: HashPassword,
  ) {
    super(UserEntity, datasource.createEntityManager());
  }

  findUserByUsername(username: string) {
    const user = this.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  isPasswordMatch(password: string, hashedPassword: string) {
    return this.hashPassword.compare(password, hashedPassword);
  }

  async validateUser(userLoginDto: UserLoginDto): Promise<UserEntity> {
    const user: UserEntity = await this.findUserByUsername(
      userLoginDto.username,
    );

    if (
      userLoginDto !== undefined &&
      user &&
      (await this.hashPassword.compare(userLoginDto.password, user.password))
    ) {
      const result = user;
      delete result.password;
      return result;
    }
    throw new ForbiddenException('Username Or Password are incorrect');
  }
}
