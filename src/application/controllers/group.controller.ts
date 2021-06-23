import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { GroupService } from '../../domain/services/group.service';
import { CreateGroupDto } from '../dtos/group/create-group.dto';
import { UpdateGroupDto } from '../dtos/group/update-group.dto';
import { FindGroupDto } from '../dtos/group/find-group.dto';
import { DeleteGroupDto } from '../dtos/group/delete-group.dto';
import { GroupIdExistsDto } from '../dtos/group/group-id-exists.dto';

import { Group } from '../../domain/entities/group.entity';

@Controller()
export class GroupController {
  constructor(
    @Inject('GROUP_SERVICE') private readonly groupService: GroupService,
  ) {}

  @MessagePattern('createGroup')
  async create(
    @Payload()
    createGroupDto: CreateGroupDto,
  ): Promise<Group> {
    return await this.groupService.create(createGroupDto);
  }

  @MessagePattern('findAllGroup')
  async findAll(@Payload() findGroup: FindGroupDto): Promise<Group[]> {
    return await this.groupService.findAll(findGroup);
  }

  @MessagePattern('findAllCountGroup')
  async findAllCount(@Payload() findGroup: FindGroupDto): Promise<number> {
    return await this.groupService.findAllCount(findGroup);
  }

  @MessagePattern('findOneGroup')
  async findOne(@Payload() findGroup: FindGroupDto): Promise<Group> {
    return await this.groupService.findOne(findGroup);
  }

  @MessagePattern('updateGroup')
  async update(@Payload() updateGroupDto: UpdateGroupDto): Promise<Group> {
    return await this.groupService.update(updateGroupDto);
  }

  @MessagePattern('removeGroup')
  async remove(@Payload() deleteGroup: DeleteGroupDto): Promise<Group> {
    return await this.groupService.remove(deleteGroup);
  }

  @MessagePattern('existsGroup')
  async existsGroupId(
    @Payload() groupIdExistsDto: GroupIdExistsDto,
  ): Promise<boolean> {
    return await this.groupService.idExists(groupIdExistsDto);
  }
}
