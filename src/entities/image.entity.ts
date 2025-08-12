import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CommonBaseEntity } from './common-base.entity';
import { Expose } from 'class-transformer';

@Entity('images')
export class ImageEntity extends CommonBaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column()
  @Expose({ name: 'original_name' })
  public originalName?: string;

  @Column()
  public key?: string;

  @Column()
  public mimetype?: string;

  @Column()
  public size?: number;
}
