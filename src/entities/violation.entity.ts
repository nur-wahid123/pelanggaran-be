import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonBaseEntity } from './common-base.entity';
import { UserEntity } from './user.entity';
import { StudentEntity } from './student.entity';
import { ViolationTypeEntity } from './violation-type.entity';
import { Expose } from 'class-transformer';
import { ViolationCollectionEntity } from './violation-collection.entity';

@Entity('violations')
export class ViolationEntity extends CommonBaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column()
  public date?: Date;

  @Column({ type: 'text', nullable: true })
  public note?: string;

  @ManyToOne(() => ViolationCollectionEntity)
  public violationCollection?: ViolationCollectionEntity;

  @ManyToOne(() => UserEntity, (user) => user.violations)
  public creator?: UserEntity;

  @ManyToOne(() => StudentEntity, (s) => s.violations)
  public student?: StudentEntity;

  @ManyToMany(() => ViolationTypeEntity, (vt) => vt.violations)
  @JoinTable()
  @Expose({ name: 'violation_types' })
  public violationTypes?: ViolationTypeEntity[];
}
