import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SetLabelAccountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  publicKey:string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label:string
}