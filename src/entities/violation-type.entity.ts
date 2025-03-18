import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CommonBaseEntity } from './common-base.entity';
import { ViolationEntity } from './violation.entity';

@Entity('violation_types')
export class ViolationTypeEntity extends CommonBaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column()
  public name?: string;

  @Column()
  public point?: number;

  @ManyToMany(() => ViolationEntity, (v) => v.violationTypes)
  public violations?: ViolationEntity[];
}
