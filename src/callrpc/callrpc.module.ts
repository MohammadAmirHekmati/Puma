import { Module } from '@nestjs/common';
import { CallrpcService } from './callrpc.service';

@Module({
  providers: [CallrpcService]
})
export class CallrpcModule {}
