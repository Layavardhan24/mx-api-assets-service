import { Injectable } from "@nestjs/common";
import { configuration } from "./configuration";

export interface NetworkConfig {
  chainID: 'D' | 'T' | '1' | 'L';
}

@Injectable()
export class NetworkConfigService {
  private readonly localDevnetConfig: NetworkConfig = {
    chainID: 'L',
  };
  private readonly devnetConfig: NetworkConfig = {
    chainID: 'D',
  };
  private readonly testnetConfig: NetworkConfig = {
    chainID: 'T',
  };
  private readonly mainnetConfig: NetworkConfig = {
    chainID: '1',
  };

  public readonly config: NetworkConfig;

  constructor() {
    const network = configuration().libs.common.network;

    const networkConfigs = {
      'local-devnet': this.localDevnetConfig,
      devnet: this.devnetConfig,
      testnet: this.testnetConfig,
      mainnet: this.mainnetConfig,
    };

    this.config = networkConfigs[network];
  }

  getNetworkConfig(): NetworkConfig {
    return this.config;
  }
}
