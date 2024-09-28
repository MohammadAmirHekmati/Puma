 export interface CreateAssetResponse {
    ref_block_num: number;
    ref_block_prefix: number;
    expiration: Date;
    operations: any[][];
    extensions: any[];
    signatures: string[];
  }

