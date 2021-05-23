import { Module } from '@nestjs/common';

import { ContactExistsRule } from './rules/contact-exists.rule';
import { GroupExistsRule } from './rules/group-exists.rule';

import { DomainModule } from '../domain/domain.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { ContactController } from './controllers/contact.controller';
import { GroupController } from './controllers/group.controller';

@Module({
  imports: [InfrastructureModule, DomainModule],
  controllers: [ContactController, GroupController],
  providers: [ContactExistsRule, GroupExistsRule],
  exports: [InfrastructureModule, DomainModule],
})
export class ApplicationModule {}
