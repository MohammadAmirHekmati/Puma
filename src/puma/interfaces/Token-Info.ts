export interface Base {
  amount: number;
  asset_id: string;
}

export interface Quote {
  amount: number;
  asset_id: string;
}

export interface Core_exchange_rate {
  base: Base;
  quote: Quote;
}

export interface Extensions {}

export interface Options {
  max_supply: string;
  market_fee_percent: number;
  max_market_fee: string;
  issuer_permissions: number;
  flags: number;
  core_exchange_rate: Core_exchange_rate;
  whitelist_authorities: any[];
  blacklist_authorities: any[];
  whitelist_markets: any[];
  blacklist_markets: any[];
  description: string;
  extensions: Extensions;
}

export interface TokenInfo {
  id: string;
  symbol: string;
  precision: number;
  issuer: string;
  options: Options;
  dynamic_asset_data_id: string;
  total_in_collateral: number;
}