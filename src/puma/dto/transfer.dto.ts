import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TransferDto {
  @ApiProperty({description:"the account name or id want to do the transfer"})
  @IsString()
  @IsNotEmpty()
  fromAccount:string

  @ApiProperty({description:"the account name or id want to receive"})
  @IsString()
  @IsNotEmpty()
  toAccount:string

  @ApiProperty({description:"amount is string but inside should be number",example:"5000"})
  @IsString()
  @IsNotEmpty()
  amount:string

  @ApiProperty({description:"id of asset you want to transfer",example:"1.3.0"})
  @IsString()
  @IsNotEmpty()
  assetId:string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  memo:string
}