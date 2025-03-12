import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CommonBaseEntity } from './common-base.entity';
import { ViolationEntity } from './violation.entity';

@Entity('violation_collection')
export class ViolationCollectionEntity extends CommonBaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @OneToMany(
    () => ViolationEntity,
    (violation) => violation.violationCollection,
  )
  public violations?: ViolationEntity[];
}
