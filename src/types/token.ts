export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  mintAuthority: string;
  freezeAuthority?: string;
  tokenAddress?: string;
  metadataUri?: string;
}

export interface TokenMintParams {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  mintAuthority: string;
  freezeAuthority?: string;
  metadataUri?: string;
}

export interface TokenMintResult {
  mintAddress: string;
  signature: string;
  error?: string;
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  uri?: string;
  sellerFeeBasisPoints?: number;
  creators?: Array<{
    address: string;
    verified: boolean;
    share: number;
  }>;
}
