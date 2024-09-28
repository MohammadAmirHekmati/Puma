
  export interface Op {
    id: string;
    op: any[];
    result: any[];
    block_num: number;
    trx_in_block: number;
    op_in_trx: number;
    virtual_op: number;
  }

  export interface AccountHistoryResponse {
    memo: string;
    description: string;
    op: Op;
  }
