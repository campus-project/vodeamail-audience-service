import { CreateContactDto } from './create-contact.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateContactDto extends CreateContactDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;
}
