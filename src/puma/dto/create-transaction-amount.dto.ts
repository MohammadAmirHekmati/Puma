import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionAmountDto {
  @ApiProperty()
  amount:number

  @ApiProperty({description:"it should be asset name or asset id"})
  asset:string
}