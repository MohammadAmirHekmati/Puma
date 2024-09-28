import { Module } from '@nestjs/common';
import { CallrpcModule } from './callrpc/callrpc.module';
import { DatabaseModule } from './database/database.module';
import { PumaModule } from './puma/puma.module';
import { AppController } from './app.controller';

@Module({
  imports: [CallrpcModule, DatabaseModule, PumaModule],
  controllers:[AppController]
})
export class AppModule {}
