import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonBaseEntity } from './common-base.entity';
import { ImageEntity } from './image.entity';

@Entity('image_links')
export class ImageLinks extends CommonBaseEntity {
  @PrimaryGeneratedColumn()
  public imageLinkId?: number;

  @Column()
  id: number; // "group id", same across multiple rows

  @ManyToOne(() => ImageEntity, { eager: true })
  @JoinColumn({ name: 'image_id' })
  image: ImageEntity;

  @Column({ name: 'image_id' })
  imageId: number;
}
