import { CreateGroupDto } from './create-group.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateGroupDto extends CreateGroupDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;
}
