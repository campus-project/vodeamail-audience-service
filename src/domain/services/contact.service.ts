import { HttpStatus, Injectable } from '@nestjs/common';
import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';
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
    const { relations } = findAllContactDto;
    const data = await this.findQueryBuilder(findAllContactDto).getMany();

    if (relations === undefined || relations.length == 0) {
      return data;
    }

    const contactIds = [];

    const relationValues = {
      contactGroups: undefined,
    };

    data.forEach((contact) => {
      contactIds.push(contact.id);
    });

    if (relations.includes('groups')) {
      relationValues.contactGroups = await this.contactGroupRepository.find({
        where: { contact_id: In([...new Set(contactIds)]) },
        relations: ['group'],
      });
    }

    return data.map((contact) => {
      if (relationValues.contactGroups !== undefined) {
        const groups = [];
        relationValues.contactGroups.forEach((contactGroup) => {
          if (contactGroup.contact_id === contact.id) {
            groups.push(contactGroup.group);
          }
        });

        Object.assign(contact, {
          groups,
        });
      }

      return contact;
    });
  }

  async findAllCount(findAllCountContactDto: FindContactDto): Promise<number> {
    return await this.findQueryBuilder(findAllCountContactDto).getCount();
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
    return (
      (await this.contactRepository.count({
        where: { id, organization_id },
      })) > 0
    );
  }

  findQueryBuilder(params: FindContactDto): SelectQueryBuilder<Contact> {
    const {
      id,
      ids,
      organization_id,
      is_subscribed,
      group_ids,
      search,
      per_page,
      page = 1,
      order_by,
      sorted_by = 'ASC',
    } = params;

    const filteredIds = ids === undefined ? [] : ids;
    if (id !== undefined) {
      filteredIds.push(id);
    }

    let qb = this.contactRepository
      .createQueryBuilder('contact')
      .leftJoin('contact.contact_groups', 'contact_groups')
      .innerJoinAndSelect('contact.summary', 'summary')
      .where((qb) => {
        qb.where({
          organization_id: organization_id,
          ...(id || ids ? { id: In(filteredIds) } : {}),
          ...(is_subscribed !== undefined ? { is_subscribed } : {}),
        });

        if (group_ids !== undefined) {
          qb.andWhere('contact_groups.group_id IN (:...groupIds)', {
            groupIds: group_ids,
          });
        }

        if (search !== undefined) {
          const params = { search: `%${search}%` };

          qb.andWhere(
            new Brackets((q) => {
              q.where('contact.email LIKE :search', params);
            }),
          );
        }
      });

    if (per_page !== undefined) {
      qb = qb.take(per_page).skip(page > 1 ? per_page * (page - 1) : 0);
    }

    if (order_by !== undefined) {
      qb = qb.orderBy(
        order_by,
        ['desc'].includes(sorted_by.toLowerCase()) ? 'DESC' : 'ASC',
      );
    }

    return qb;
  }
}
