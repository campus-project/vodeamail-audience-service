import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Validate,
} from 'class-validator';
import { ContactExistsRule } from '../../rules/contact-exists.rule';

export class CreateGroupDto {
  @IsNotEmpty()
  @IsUUID('4')
  organization_id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_visible?: boolean;

  @IsArray()
  @IsUUID('4', { each: true })
  @Validate(ContactExistsRule, { each: true })
  contact_ids: string[];

  @IsOptional()
  @IsUUID('4')
  actor?: string;
}
