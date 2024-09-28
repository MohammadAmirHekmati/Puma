import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class WitnessesListDto {
  @ApiProperty({description:"Lowerbound is the word you wanna find witnesses by it " +
      "it should be empty string"})
  @IsString()
  lowerbound:string

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  limit:number
}