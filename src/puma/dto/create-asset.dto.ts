import { IsLowercase, IsNotEmpty, IsNumber, IsOptional, IsString, IsUppercase } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssetDto {

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsUppercase()
  symbol:string

  @ApiProperty({description:"The Value is string but inside of string should be number", example:"5"})
  @IsString()
  @IsNotEmpty()
  decimal:string

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  maxSupply:number

  @ApiProperty()
  @IsOptional()
  @IsString()
  description:string
}