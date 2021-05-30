import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContactGroup } from './contact-group.entity';
import { SummaryGroupView } from '../views/summary-group.view';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organization_id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  @CreateDateColumn()
  created_at: string;

  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @UpdateDateColumn()
  updated_at: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @DeleteDateColumn()
  deleted_at?: string;

  @Column({ type: 'uuid', nullable: true })
  deleted_by?: string;

  @OneToMany(() => ContactGroup, (object) => object.group, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  contact_groups: ContactGroup[];

  @OneToOne(() => SummaryGroupView, (object) => object.group)
  @JoinColumn()
  summary: SummaryGroupView;
}
