import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../dto';

export class UpdateAuthDto extends PartialType(CreateUserDto) {}
