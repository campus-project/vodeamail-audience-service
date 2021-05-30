import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { GroupService } from '../../domain/services/group.service';
import { CreateGroupDto } from '../dtos/group/create-group.dto';
import { UpdateGroupDto } from '../dtos/group/update-group.dto';
import { FindGroupDto } from '../dtos/group/find-group.dto';
import { DeleteGroupDto } from '../dtos/group/delete-group.dto';
import { GroupIdExistsDto } from '../dtos/group/group-id-exists.dto';

@Controller()
export class GroupController {
  constructor(
    @Inject('GROUP_SERVICE') private readonly groupService: GroupService,
  ) {}

  @MessagePattern('createGroup')
  create(
    @Payload('value')
    createGroupDto: CreateGroupDto,
  ) {
    return this.groupService.create(createGroupDto);
  }

  @MessagePattern('findAllGroup')
  findAll(@Payload('value') findGroup: FindGroupDto) {
    return this.groupService.findAll(findGroup);
  }

  @MessagePattern('findAllCountGroup')
  findAllCount(@Payload('value') findGroup: FindGroupDto) {
    return this.groupService.findAllCount(findGroup);
  }

  @MessagePattern('findOneGroup')
  findOne(@Payload('value') findGroup: FindGroupDto) {
    return this.groupService.findOne(findGroup);
  }

  @MessagePattern('updateGroup')
  update(@Payload('value') updateGroupDto: UpdateGroupDto) {
    return this.groupService.update(updateGroupDto);
  }

  @MessagePattern('removeGroup')
  remove(@Payload('value') deleteGroup: DeleteGroupDto) {
    return this.groupService.remove(deleteGroup);
  }

  @MessagePattern('existsGroup')
  existsGroupId(@Payload('value') groupIdExistsDto: GroupIdExistsDto) {
    return this.groupService.idExists(groupIdExistsDto);
  }
}
