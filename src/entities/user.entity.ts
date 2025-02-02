import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CommonBaseEntity } from './common-base.entity';
import { RoleEnum } from './../commons/enums/role.enum';
import { ViolationEntity } from './violation.entity';

@Entity('users')
export class UserEntity extends CommonBaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column()
  public name?: string;

  @Column({ unique: true, nullable: false })
  public username?: string;

  @Column({ nullable: false })
  public password?: string;

  @Column({ type: 'enum', enum: RoleEnum })
  public role?: RoleEnum;

  @OneToMany(() => ViolationEntity, (violation) => violation.creator)
  public violations?: ViolationEntity;
}
