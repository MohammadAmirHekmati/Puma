import { IsLowercase, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AccountProperties {
  @IsString()
  @IsNotEmpty()
  @IsLowercase()
  @ApiProperty()
  accountName:string
}