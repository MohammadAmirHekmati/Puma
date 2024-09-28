import { ApiProperty } from '@nestjs/swagger';
import { IsLowercase, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AccountWithLowerboundAndLimitDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsLowercase()
  lowerbound:string

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  limit:number
}