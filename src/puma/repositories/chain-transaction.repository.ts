import { EntityRepository, Repository } from 'typeorm';
import { ChainTransactionEntity } from '../entities/chain-transaction.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
@EntityRepository(ChainTransactionEntity)
export class ChainTransactionRepository extends Repository<ChainTransactionEntity>{

}