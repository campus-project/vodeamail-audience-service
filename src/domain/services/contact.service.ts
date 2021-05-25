import { HttpStatus, Injectable } from '@nestjs/common';
import { In, Raw, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';

import * as _ from 'lodash';

import { Contact } from '../entities/contact.entity';
import { ContactGroup } from '../entities/contact-group.entity';
import { Group } from '../entities/group.entity';
import { CreateContactDto } from '../../application/dtos/contact/create-contact.dto';
import { UpdateContactDto } from '../../application/dtos/contact/update-contact.dto';
import { FindContactDto } from '../../application/dtos/contact/find-contact.dto';
import { DeleteContactDto } from '../../application/dtos/contact/delete-contact.dto';
import { ContactIdExistsDto } from '../../application/dtos/contact/contact-id-exists.dto';
import { UpdateSubscribeContactDto } from '../../application/dtos/contact/update-subscribe-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(ContactGroup)
    private readonly contactGroupRepository: Repository<ContactGroup>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const {
      organization_id,
      email,
      name,
      mobile_phone,
      address_line_1,
      address_line_2,
      country,
      province,
      city,
      postal_code,
      is_subscribed,
      group_ids,
      actor,
    } = createContactDto;

    const data = await this.contactRepository.save({
      organization_id,
      email,
      name,
      mobile_phone,
      address_line_1,
      address_line_2,
      country,
      province,
      city,
      postal_code,
      is_subscribed,
      updated_by: actor,
    });

    if (group_ids.length) {
      const groups = await this.groupRepository.find({
        where: {
          id: In([...new Set(group_ids)]),
          organization_id,
        },
      });

      for (const group of groups) {
        await this.contactGroupRepository.save({
          group_id: group.id,
          contact: data,
        });
      }
    }

    return await this.findOne({
      id: data.id,
      organization_id: data.organization_id,
    });
  }

  async findAll(findAllContactDto: FindContactDto): Promise<Contact[]> {
    const { id, ids, group_ids, organization_id } = findAllContactDto;

    const filteredIds = ids === undefined ? [] : ids;
    if (id !== undefined) {
      filteredIds.push(id);
    }

    return await this.contactRepository.find({
      join: {
        alias: 'contact',
        leftJoinAndSelect: {
          contact_groups: 'contact.contact_groups',
        },
      },
      where: (qb) => {
        qb.where({
          organization_id: organization_id,
          ...(id || ids ? { id: In(filteredIds) } : {}),
        });

        if (group_ids !== undefined) {
          qb.andWhere('contact_groups.group_id IN (:...groupIds)', {
            groupIds: group_ids,
          });
        }
      },
    });
  }

  async findOne(findOneContactDto: FindContactDto): Promise<Contact> {
    const data = await this.findAll(findOneContactDto);
    return _.head(data);
  }

  async update(updateContactDto: UpdateContactDto): Promise<Contact> {
    const {
      id,
      organization_id,
      email,
      name,
      mobile_phone,
      address_line_1,
      address_line_2,
      country,
      province,
      city,
      postal_code,
      is_subscribed,
      group_ids,
      actor,
    } = updateContactDto;

    const data = await this.contactRepository.findOne({
      where: {
        id,
        organization_id,
      },
    });

    if (!data) {
      throw new RpcException(
        JSON.stringify({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Count not find resource ${id}.`,
          error: 'Not Found',
        }),
      );
    }

    await this.contactGroupRepository.delete({ contact_id: id });

    await this.contactRepository.save({
      ...data,
      email,
      name,
      mobile_phone,
      address_line_1,
      address_line_2,
      country,
      province,
      city,
      postal_code,
      is_subscribed,
      updated_by: actor,
    });

    if (group_ids.length) {
      const groups = await this.groupRepository.find({
        where: {
          id: In([...new Set(group_ids)]),
          organization_id,
        },
      });

      for (const group of groups) {
        await this.contactGroupRepository.save(
          this.contactGroupRepository.create({
            group_id: group.id,
            contact: data,
          }),
        );
      }
    }

    return await this.findOne({
      id: data.id,
      organization_id: data.organization_id,
    });
  }

  async updateSubscribe(
    updateSubscribeContactDto: UpdateSubscribeContactDto,
  ): Promise<Contact> {
    const { id, organization_id, is_subscribed } = updateSubscribeContactDto;

    const data = await this.contactRepository.findOne({
      where: {
        id,
        organization_id,
      },
    });

    if (!data) {
      throw new RpcException(
        JSON.stringify({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Count not find resource ${id}.`,
          error: 'Not Found',
        }),
      );
    }

    await this.contactRepository.save({
      ...data,
      is_subscribed,
    });

    return await this.findOne({
      id: data.id,
      organization_id: data.organization_id,
    });
  }

  async remove(deleteContactDto: DeleteContactDto): Promise<Contact> {
    const { id, is_hard, organization_id, actor } = deleteContactDto;

    const data = await this.contactRepository.findOne({
      where: {
        id,
        organization_id,
      },
    });

    if (!data) {
      throw new RpcException(
        JSON.stringify({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Count not find resource ${id}.`,
          error: 'Not Found',
        }),
      );
    }

    if (is_hard) {
      await this.contactRepository.remove(data);
    } else {
      await this.contactRepository.save({
        ...data,
        deleted_by: actor,
        deleted_at: new Date().toISOString(),
      });
    }

    return data;
  }

  async idExists(contactIdExistsDto: ContactIdExistsDto): Promise<boolean> {
    const { id, organization_id } = contactIdExistsDto;
    return !!(await this.contactRepository.findOne({
      where: { id, organization_id },
    }));
  }
}
