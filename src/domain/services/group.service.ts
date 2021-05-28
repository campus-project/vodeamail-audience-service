import { HttpStatus, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';

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
    const {
      organization_id,
      name,
      description,
      is_visible,
      contact_ids,
      actor,
    } = createGroupDto;

    const data = await this.groupRepository.save({
      organization_id,
      name,
      description,
      is_visible,
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
    const { id, ids, organization_id } = findAllGroupDto;

    const filteredIds = ids === undefined ? [] : ids;
    if (id !== undefined) {
      filteredIds.push(id);
    }

    return await this.groupRepository.find({
      where: {
        organization_id: organization_id,
        ...(id || ids ? { id: In(filteredIds) } : {}),
      },
    });
  }

  async findOne(findOneGroupDto: FindGroupDto): Promise<Group> {
    const data = await this.findAll(findOneGroupDto);
    return _.head(data);
  }

  async update(updateGroupDto: UpdateGroupDto): Promise<Group> {
    const {
      id,
      organization_id,
      name,
      description,
      is_visible,
      contact_ids,
      actor,
    } = updateGroupDto;

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
      is_visible,
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
}
