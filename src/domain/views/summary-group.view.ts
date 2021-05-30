import { JoinColumn, OneToOne, ViewColumn, ViewEntity } from 'typeorm';
import { Group } from '../entities/group.entity';

@ViewEntity({
  name: 'summary_groups',
  expression: `
    SELECT
      groups.id group_id,
      COALESCE ( contact_groups.total_contact, 0 ) total_contact 
    FROM
      groups
    LEFT JOIN ( 
      SELECT 
        contact_groups.group_id, 
        COUNT( DISTINCT contact_groups.contact_id ) AS total_contact 
      FROM
        contact_groups
        JOIN contacts on contacts.id = contact_groups.contact_id
      WHERE
        contacts.deleted_at IS NULL
      GROUP BY 
        contact_groups.group_id 
    ) contact_groups ON contact_groups.group_id = groups.id`,
})
export class SummaryGroupView {
  @ViewColumn()
  group_id: string;

  @ViewColumn()
  total_contact: number;

  @OneToOne(() => Group, (object) => object.summary)
  @JoinColumn({ name: 'group_id' })
  group: Group;
}
