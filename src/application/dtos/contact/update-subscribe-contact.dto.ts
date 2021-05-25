import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateSubscribeContactDto {
  @IsNotEmpty()
  @IsUUID('4')
  organization_id: string;

  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  @IsNotEmpty()
  @IsBoolean()
  is_subscribed: boolean;
}
