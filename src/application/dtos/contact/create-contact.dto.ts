import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Validate,
} from 'class-validator';
import { GroupExistsRule } from '../../rules/group-exists.rule';

export class CreateContactDto {
  @IsNotEmpty()
  @IsUUID('4')
  organization_id: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  mobile_phone?: string;

  @IsOptional()
  @IsString()
  address_line_1?: string;

  @IsOptional()
  @IsString()
  address_line_2?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  postal_code?: string;

  @IsOptional()
  @IsBoolean()
  is_subscribed?: boolean;

  @IsArray()
  @IsUUID('4', { each: true })
  @Validate(GroupExistsRule, { each: true })
  group_ids: string[];

  @IsOptional()
  @IsUUID('4')
  actor?: string;
}
