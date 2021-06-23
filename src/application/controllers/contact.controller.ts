import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { ContactService } from '../../domain/services/contact.service';
import { CreateContactDto } from '../dtos/contact/create-contact.dto';
import { UpdateContactDto } from '../dtos/contact/update-contact.dto';
import { FindContactDto } from '../dtos/contact/find-contact.dto';
import { DeleteContactDto } from '../dtos/contact/delete-contact.dto';
import { UpdateSubscribeContactDto } from '../dtos/contact/update-subscribe-contact.dto';

import { Contact } from '../../domain/entities/contact.entity';

@Controller()
export class ContactController {
  constructor(
    @Inject('CONTACT_SERVICE') private readonly contactService: ContactService,
  ) {}

  @MessagePattern('createContact')
  async create(
    @Payload()
    createContactDto: CreateContactDto,
  ): Promise<Contact> {
    return await this.contactService.create(createContactDto);
  }

  @MessagePattern('findAllContact')
  async findAll(@Payload() findContact: FindContactDto): Promise<Contact[]> {
    return await this.contactService.findAll(findContact);
  }

  @MessagePattern('findAllCountContact')
  async findAllCount(@Payload() findContact: FindContactDto): Promise<number> {
    return await this.contactService.findAllCount(findContact);
  }

  @MessagePattern('findOneContact')
  async findOne(@Payload() findContact: FindContactDto): Promise<Contact> {
    return await this.contactService.findOne(findContact);
  }

  @MessagePattern('updateContact')
  async update(
    @Payload() updateContactDto: UpdateContactDto,
  ): Promise<Contact> {
    return await this.contactService.update(updateContactDto);
  }

  @MessagePattern('updateSubscribeContact')
  async updateSubscribe(
    @Payload() updateSubscribeContactDto: UpdateSubscribeContactDto,
  ): Promise<Contact> {
    return await this.contactService.updateSubscribe(updateSubscribeContactDto);
  }

  @MessagePattern('removeContact')
  async remove(@Payload() deleteContact: DeleteContactDto): Promise<Contact> {
    return await this.contactService.remove(deleteContact);
  }
}
