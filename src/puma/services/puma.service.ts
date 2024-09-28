import { BadRequestException, Injectable } from '@nestjs/common';
import { CallrpcService } from '../../callrpc/callrpc.service';
import { RpcResponseError } from 'jsonrpc-ts';
import { SuggestBrainKeyResponse } from '../interfaces/responses/accounts/suggest-brain-key.response';
import { CreateWalletDto } from '../dto/create-wallet.dto';
import { ChainWalletEntity } from '../entities/chain-wallet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sha512 } from 'js-sha512';
import { AccountInfoResponse } from '../interfaces/responses/accounts/account-info.response';
import { PumaTransactionService } from './puma.transaction.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { TokenInfo } from '../interfaces/Token-Info';
import { GetAccountResponse } from '../interfaces/responses/accounts/get-account.response';
import { TransferDto } from '../dto/transfer.dto';
import { ChainWalletRepository } from '../repositories/chain-wallet.repository';
import { BlockResponse } from '../interfaces/responses/block-response';
import { ChainTransactionRepository } from '../repositories/chain-transaction.repository';
import { PumaAccountService } from './puma-account.service';
import { AccountCountAndTransactionCountInterface } from '../interfaces/account-Count-And-Transaction-Count.interface';
import { BlockInfoConverted } from '../interfaces/block-info.converted';

@Injectable()
export class PumaService {
  constructor(
    private pumaTransactionService:PumaTransactionService,
    private accountService:PumaAccountService,
    private callrpcService: CallrpcService,
              @InjectRepository(ChainWalletRepository)private pumaWalletRepo: ChainWalletRepository,
    @InjectRepository(ChainTransactionRepository) private pumaTransactionRepo:ChainTransactionRepository
  ) {}

  async getBlockByNumber(blockNumber: number): Promise<any> {
    const method = 'get_block';
    const params = [blockNumber];
    const callRpc = await this.callrpcService.pumaWalletCallRpc(method, params);
    if (callRpc.error) throw new BadRequestException(callRpc.error);

    const data:BlockResponse=callRpc.result;

    const converted:BlockInfoConverted=
      {
        block_id:data.block_id,
        previous:data.previous,
        signing_key:data.signing_key,
        timestamp:data.timestamp,
        witness:data.witness,
        witness_signature:data.witness_signature
      }

    return converted
  }

  async blockTransactions(blockNumber: number):Promise<any>
  {
    const blockTransaction=await this.pumaTransactionRepo.find({where:{block:blockNumber}})
      return blockTransaction
  }

  async accountCountAndTransactionCount():Promise<any>
  {
    const accountCount=await this.accountService.accountCount()
    const transactionCount=await this.pumaTransactionService.lastetBuilderNumber()
    const accountCountAndTransactionCountInterface:AccountCountAndTransactionCountInterface=
      {
        totalAccounts:accountCount,
        totalTxns:transactionCount.builderNumber
      }
      return accountCountAndTransactionCountInterface
  }
}
