import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { ContactService } from '../../domain/services/contact.service';
import { CreateContactDto } from '../dtos/contact/create-contact.dto';
import { UpdateContactDto } from '../dtos/contact/update-contact.dto';
import { FindContactDto } from '../dtos/contact/find-contact.dto';
import { DeleteContactDto } from '../dtos/contact/delete-contact.dto';

@Controller()
export class ContactController {
  constructor(
    @Inject('CONTACT_SERVICE') private readonly contactService: ContactService,
  ) {}

  @MessagePattern('createContact')
  create(
    @Payload('value')
    createContactDto: CreateContactDto,
  ) {
    return this.contactService.create(createContactDto);
  }

  @MessagePattern('findAllContact')
  findAll(@Payload('value') findContact: FindContactDto) {
    return this.contactService.findAll(findContact);
  }

  @MessagePattern('findOneContact')
  findOne(@Payload('value') findContact: FindContactDto) {
    return this.contactService.findOne(findContact);
  }

  @MessagePattern('updateContact')
  update(@Payload('value') updateContactDto: UpdateContactDto) {
    return this.contactService.update(updateContactDto);
  }

  @MessagePattern('removeContact')
  remove(@Payload('value') deleteContact: DeleteContactDto) {
    return this.contactService.remove(deleteContact);
  }
}
