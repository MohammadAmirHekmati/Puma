import { Injectable } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { ChainWalletEntity } from '../entities/chain-wallet.entity';

@Injectable()
@EntityRepository(ChainWalletEntity)
export class ChainWalletRepository extends Repository<ChainWalletEntity>{

}