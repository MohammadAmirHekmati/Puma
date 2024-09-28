import { ApiProperty } from '@nestjs/swagger';
import { IsLowercase, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AccountHistoryDto {

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsLowercase()
  accountName:string

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  limit:number
}