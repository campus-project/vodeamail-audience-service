import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';
import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';

import * as _ from 'lodash';

import { Group } from '../entities/group.entity';
import { ContactGroup } from '../entities/contact-group.entity';
import { Contact } from '../entities/contact.entity';
import { CreateGroupDto } from '../../application/dtos/group/create-group.dto';
import { UpdateGroupDto } from '../../application/dtos/group/update-group.dto';
import { FindGroupDto } from '../../application/dtos/group/find-group.dto';
import { DeleteGroupDto } from '../../application/dtos/group/delete-group.dto';
import { GroupIdExistsDto } from '../../application/dtos/group/group-id-exists.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(ContactGroup)
    private readonly contactGroupRepository: Repository<ContactGroup>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const { organization_id, name, description, contact_ids, actor } =
      createGroupDto;

    const data = await this.groupRepository.save({
      organization_id,
      name,
      description,
      created_by: actor,
      updated_by: actor,
    });

    if (contact_ids.length) {
      const contacts = await this.contactRepository.find({
        where: {
          id: In([...new Set(contact_ids)]),
          organization_id,
        },
      });

      for (const contact of contacts) {
        await this.contactGroupRepository.save(
          this.contactGroupRepository.create({
            contact_id: contact.id,
            group: data,
          }),
        );
      }
    }

    return await this.findOne({
      id: data.id,
      organization_id: data.organization_id,
    });
  }

  async findAll(findAllGroupDto: FindGroupDto): Promise<Group[]> {
    const { relations } = findAllGroupDto;
    const data = await this.findQueryBuilder(findAllGroupDto).getMany();

    if (relations === undefined || relations.length === 0) {
      return data;
    }

    const groupIds = [];

    const relationValues = {
      contactGroups: undefined,
    };

    data.forEach((group) => {
      groupIds.push(group.id);
    });

    if (relations.includes('contacts')) {
      relationValues.contactGroups = await this.contactGroupRepository.find({
        where: { group_id: In([...new Set(groupIds)]) },
        relations: ['contact'],
      });
    }

    return data.map((group) => {
      if (relationValues.contactGroups !== undefined) {
        const contacts = [];
        relationValues.contactGroups.forEach((contactGroup) => {
          if (contactGroup.group_id === group.id) {
            contacts.push(contactGroup.contact);
          }
        });

        Object.assign(group, {
          contacts,
        });
      }

      return group;
    });
  }

  async findAllCount(findAllCountGroupDto: FindGroupDto): Promise<number> {
    return await this.findQueryBuilder(findAllCountGroupDto).getCount();
  }

  async findOne(findOneGroupDto: FindGroupDto): Promise<Group> {
    const data = await this.findAll(findOneGroupDto);
    return _.head(data);
  }

  async update(updateGroupDto: UpdateGroupDto): Promise<Group> {
    const { id, organization_id, name, description, contact_ids, actor } =
      updateGroupDto;

    const data = await this.groupRepository.findOne({
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

    await this.contactGroupRepository.delete({ group_id: id });

    await this.groupRepository.save({
      ...data,
      name,
      description,
      updated_by: actor,
    });

    if (contact_ids.length) {
      const contacts = await this.contactRepository.find({
        where: {
          id: In([...new Set(contact_ids)]),
          organization_id,
        },
      });

      for (const contact of contacts) {
        await this.contactGroupRepository.save(
          this.contactGroupRepository.create({
            contact_id: contact.id,
            group: data,
          }),
        );
      }
    }

    return await this.findOne({
      id: data.id,
      organization_id: data.organization_id,
    });
  }

  async remove(deleteGroupDto: DeleteGroupDto): Promise<Group> {
    const { id, is_hard, organization_id, actor } = deleteGroupDto;

    const data = await this.groupRepository.findOne({
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
      await this.groupRepository.remove(data);
    } else {
      await this.groupRepository.save({
        ...data,
        deleted_by: actor,
        deleted_at: new Date().toISOString(),
      });
    }

    return data;
  }

  async idExists(groupIdExistsDto: GroupIdExistsDto): Promise<boolean> {
    const { id, organization_id } = groupIdExistsDto;
    return (
      (await this.groupRepository.count({
        where: { id, organization_id },
      })) > 0
    );
  }

  findQueryBuilder(params: FindGroupDto): SelectQueryBuilder<Group> {
    const {
      id,
      ids,
      organization_id,
      contact_ids,
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

    let qb = this.groupRepository
      .createQueryBuilder('group')
      .leftJoin('group.contact_groups', 'contact_groups')
      .innerJoinAndSelect('group.summary', 'summary')
      .where((qb) => {
        qb.where({
          organization_id: organization_id,
          ...(id || ids ? { id: In(filteredIds) } : {}),
        });

        if (contact_ids !== undefined) {
          qb.andWhere('contact_groups.contact_id IN (:...contactIds)', {
            contactIds: contact_ids,
          });
        }

        if (search !== undefined) {
          const params = { search: `%${search}%` };

          qb.andWhere(
            new Brackets((q) => {
              q.where('group.name LIKE :search', params);
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
