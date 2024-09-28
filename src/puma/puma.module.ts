import { Module } from '@nestjs/common';
import { PumaController } from './controllers/puma.controller';
import { PumaService } from './services/puma.service';
import { CallrpcService } from '../callrpc/callrpc.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChainWalletEntity } from './entities/chain-wallet.entity';
import { PumaTransactionService } from './services/puma.transaction.service';
import { PumaGateway } from './services/puma-gateway';
import { PumaAccountController } from './controllers/puma-account.controller';
import { PumaAssetController } from './controllers/puma-asset.controller';
import { PumaTransactionController } from './controllers/puma-transaction.controller';
import { PumaAssetsService } from './services/puma-assets.service';
import { PumaAccountService } from './services/puma-account.service';
import { ChainWalletRepository } from './repositories/chain-wallet.repository';
import { ChainTransactionRepository } from './repositories/chain-transaction.repository';
import { ScheduleModule } from '@nestjs/schedule';
import { ChainAssetRepo } from './repositories/chain-asset.repo';

@Module({
  imports:[
    TypeOrmModule.forFeature([ChainWalletRepository,ChainTransactionRepository,ChainAssetRepo]),
    ScheduleModule.forRoot()
  ],
  controllers:[PumaController,PumaAccountController,PumaAssetController,PumaTransactionController],
  providers:[PumaService,CallrpcService,PumaTransactionService,PumaGateway,PumaTransactionService,PumaAssetsService,PumaAccountService]
})
export class PumaModule {}
