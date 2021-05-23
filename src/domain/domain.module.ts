import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { ContactService } from './services/contact.service';
import { GroupService } from './services/group.service';
import { Contact } from './entities/contact.entity';
import { Group } from './entities/group.entity';
import { ContactGroup } from './entities/contact-group.entity';

const providers: Provider[] = [
  {
    provide: 'CONTACT_SERVICE',
    useClass: ContactService,
  },
  {
    provide: 'GROUP_SERVICE',
    useClass: GroupService,
  },
];

@Module({
  imports: [
    InfrastructureModule,
    TypeOrmModule.forFeature([Contact, Group, ContactGroup]),
  ],
  providers: [...providers],
  exports: [...providers],
})
export class DomainModule {}
