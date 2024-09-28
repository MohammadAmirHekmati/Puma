import { StreamableFile } from '@nestjs/common';

export class ConvertedAssetInfoResponse {
  id:string
  symbol:string
  decimal:number
  issuer:string
  maxSupply:string
}