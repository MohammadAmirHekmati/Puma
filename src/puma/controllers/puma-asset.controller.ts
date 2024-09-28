import { Body, Controller, Get, Param, Post, Query, Res, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PumaAssetsService } from '../services/puma-assets.service';
import { CreateAssetDto } from '../dto/create-asset.dto';
import { ChainWalletEntity } from '../entities/chain-wallet.entity';

@ApiTags("PUMA Assets")
@Controller("puma/assets")
export class PumaAssetController {
  constructor(private pumaAssetsService:PumaAssetsService)
  {}

  @Get('token/list')
  async getAssetList(): Promise<any>
  {
    return await this.pumaAssetsService.getAssetList();
  }

  @Post("create")
  async createAsset(@Body(ValidationPipe) createAssetDto:CreateAssetDto):Promise<any>
  {
    return await this.pumaAssetsService.createAsset(createAssetDto)
  }

  @Get("info")
  async assetInfo(@Query("asset_id_or_asset_name") asset:string):Promise<any>
  {
    return await this.pumaAssetsService.assetInfo(asset)
  }

  @Get("holders")
  async tokenHolders(@Query("symbol") symbol:string):Promise<any>
  {
    return await this.pumaAssetsService.tokenHolders(symbol)
  }

  @Get("photo/:symbol")
  async tokenPhotos(@Param("symbol") symbol:string,@Res() res):Promise<any>
  {
    return await this.pumaAssetsService.tokenPhotos(symbol, res)
  }
}