import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import { ContactService } from '../../domain/services/contact.service';

@ValidatorConstraint({ name: 'RoleExists', async: true })
@Injectable()
export class ContactExistsRule implements ValidatorConstraintInterface {
  constructor(
    @Inject('CONTACT_SERVICE')
    private contactService: ContactService,
  ) {}

  async validate(value: string, args: ValidationArguments) {
    return await this.contactService.idExists({
      id: value,
      organization_id: (args.object as any)['organization_id'],
    });
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is invalid.`;
  }
}
