export interface MultiSigWalletAdressChanged {
  id: string;
  blockTimestamp: string;
  from: string;
  newAddr: string;
  oldAddr: string;
  transactionHash: string;
  blockNumber: string;
}

export interface GraphQlResponse<T> {
  multiSigWalletAdressChangeds: T;
}

export interface GraphQLClient {
  request: <T>(
    query: string,
    variables?: Record<string, unknown>,
  ) => Promise<T>;
}
