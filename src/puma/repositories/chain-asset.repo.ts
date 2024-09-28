import { Injectable } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { ChainAssetEntity } from '../entities/chain-asset-entity';

@Injectable()
@EntityRepository(ChainAssetEntity)
export class ChainAssetRepo extends Repository<ChainAssetEntity>{

}