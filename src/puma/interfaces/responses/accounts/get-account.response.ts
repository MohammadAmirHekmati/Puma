 export interface Owner {
    weight_threshold: number;
    account_auths: any[];
    key_auths: any[][];
    address_auths: any[];
  }

  export interface Active {
    weight_threshold: number;
    account_auths: any[];
    key_auths: any[][];
    address_auths: any[];
  }

  export interface Options {
    memo_key: string;
    voting_account: string;
    num_witness: number;
    num_committee: number;
    votes: any[];
    extensions: any[];
  }

  export interface GetAccountResponse {
    id: string;
    membership_expiration_date: Date;
    registrar: string;
    referrer: string;
    lifetime_referrer: string;
    network_fee_percentage: number;
    lifetime_referrer_fee_percentage: number;
    referrer_rewards_percentage: number;
    name: string;
    owner: Owner;
    active: Active;
    options: Options;
    num_committee_voted: number;
    statistics: string;
    whitelisting_accounts: any[];
    blacklisting_accounts: any[];
    whitelisted_accounts: any[];
    blacklisted_accounts: any[];
    owner_special_authority: any[];
    active_special_authority: any[];
    top_n_control_flags: number;
  }
