import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import { GroupService } from '../../domain/services/group.service';

@ValidatorConstraint({ name: 'RoleExists', async: true })
@Injectable()
export class GroupExistsRule implements ValidatorConstraintInterface {
  constructor(
    @Inject('GROUP_SERVICE')
    private groupService: GroupService,
  ) {}

  async validate(value: string, args: ValidationArguments) {
    return await this.groupService.idExists({
      id: value,
      organization_id: (args.object as any)['organization_id'],
    });
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is invalid.`;
  }
}
