import { ApiProperty } from '@nestjs/swagger';
import { CreateTransactionOptionsDto } from './create-transaction-options.dto';

export class CreateTransactionDto {
  @ApiProperty()
options:CreateTransactionOptionsDto
}

