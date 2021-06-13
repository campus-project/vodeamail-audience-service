import { JoinColumn, OneToOne, ViewColumn, ViewEntity } from 'typeorm';
import { Contact } from '../entities/contact.entity';

@ViewEntity({
  name: 'summary_contacts',
  expression: `
    SELECT
      contacts.id contact_id,
      COALESCE ( contact_groups.total_group, 0 ) total_group 
    FROM
      contacts
    LEFT JOIN ( 
      SELECT 
        contact_groups.contact_id, 
        COUNT( DISTINCT contact_groups.group_id ) AS total_group 
      FROM
        contact_groups
        JOIN groups on groups.id = contact_groups.group_id
      WHERE
        groups.deleted_at IS NULL
      GROUP BY 
        contact_groups.contact_id 
    ) contact_groups ON contact_groups.contact_id = contacts.id`,
})
export class SummaryContactView {
  @ViewColumn()
  contact_id: string;

  @ViewColumn()
  total_group: number;

  @OneToOne(() => Contact, (object) => object.summary)
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;
}
