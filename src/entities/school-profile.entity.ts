import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('school_profile')
export class SchoolProfileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  value: string;
}
