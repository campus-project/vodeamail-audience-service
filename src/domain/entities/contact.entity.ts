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
import { SummaryContactView } from '../views/summary-contact.view';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organization_id: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  name?: string;

  @Column({ type: 'varchar', nullable: true })
  mobile_phone?: string;

  @Column({ type: 'varchar', nullable: true })
  address_line_1?: string;

  @Column({ type: 'varchar', nullable: true })
  address_line_2?: string;

  @Column({ type: 'varchar', nullable: true })
  country?: string;

  @Column({ type: 'varchar', nullable: true })
  province?: string;

  @Column({ type: 'varchar', nullable: true })
  city?: string;

  @Column({ type: 'varchar', nullable: true })
  postal_code?: string;

  @Column({ type: 'tinyint', default: 1 })
  is_subscribed: boolean;

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

  @OneToMany(() => ContactGroup, (object) => object.contact, {
    onUpdate: 'CASCADE',
  })
  contact_groups: ContactGroup[];

  @OneToOne(() => SummaryContactView, (object) => object.contact)
  summary: SummaryContactView;
}
