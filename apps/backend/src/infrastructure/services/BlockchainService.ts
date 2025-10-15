import { createPublicClient, createWalletClient, http, type PublicClient, type WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

export class BlockchainService {
  private publicClient: PublicClient;
  private walletClient?: WalletClient;
  private readonly contractAddresses: {
    minerToken: `0x${string}`;
    minerNFT: `0x${string}`;
    minerGame: `0x${string}`;
  };

  constructor(
    rpcUrl: string,
    contractAddresses: {
      minerToken: string;
      minerNFT: string;
      minerGame: string;
    },
    privateKey?: string,
  ) {
    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http(rpcUrl),
    });

    if (privateKey) {
      const account = privateKeyToAccount(privateKey as `0x${string}`);
      this.walletClient = createWalletClient({
        account,
        chain: sepolia,
        transport: http(rpcUrl),
      });
    }

    this.contractAddresses = {
      minerToken: contractAddresses.minerToken as `0x${string}`,
      minerNFT: contractAddresses.minerNFT as `0x${string}`,
      minerGame: contractAddresses.minerGame as `0x${string}`,
    };
  }

  getPublicClient(): PublicClient {
    return this.publicClient;
  }

  getWalletClient(): WalletClient | undefined {
    return this.walletClient;
  }

  getContractAddresses() {
    return this.contractAddresses;
  }

  async getBlockNumber(): Promise<bigint> {
    return await this.publicClient.getBlockNumber();
  }

  async getBalance(address: `0x${string}`): Promise<bigint> {
    return await this.publicClient.getBalance({ address });
  }

  async getTokenBalance(address: `0x${string}`): Promise<bigint> {
    const balance = await this.publicClient.readContract({
      address: this.contractAddresses.minerToken,
      abi: [{
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
      }],
      functionName: 'balanceOf',
      args: [address],
    });
    return balance as bigint;
  }

  async getNFTBalance(address: `0x${string}`): Promise<bigint> {
    const balance = await this.publicClient.readContract({
      address: this.contractAddresses.minerNFT,
      abi: [{
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'owner', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
      }],
      functionName: 'balanceOf',
      args: [address],
    });
    return balance as bigint;
  }

  async getPlayerInfo(address: `0x${string}`): Promise<{
    totalTaps: bigint;
    totalRewards: bigint;
    tapsSinceCritical: number;
    lastTapBlock: bigint;
    registeredMiners: bigint[];
  }> {
    const result = await this.publicClient.readContract({
      address: this.contractAddresses.minerGame,
      abi: [{
        name: 'getPlayerInfo',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'player', type: 'address' }],
        outputs: [
          { name: 'totalTaps', type: 'uint256' },
          { name: 'totalRewards', type: 'uint256' },
          { name: 'tapsSinceCritical', type: 'uint32' },
          { name: 'lastTapBlock', type: 'uint256' },
          { name: 'registeredMiners', type: 'uint256[]' },
        ],
      }],
      functionName: 'getPlayerInfo',
      args: [address],
    }) as [bigint, bigint, number, bigint, bigint[]];

    return {
      totalTaps: result[0],
      totalRewards: result[1],
      tapsSinceCritical: result[2],
      lastTapBlock: result[3],
      registeredMiners: result[4],
    };
  }

  async getMinerInfo(tokenId: bigint): Promise<{
    owner: `0x${string}`;
    rarity: number;
    basePower: bigint;
    level: number;
  }> {
    const result = await this.publicClient.readContract({
      address: this.contractAddresses.minerNFT,
      abi: [{
        name: 'getMinerInfo',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        outputs: [
          { name: 'owner', type: 'address' },
          { name: 'rarity', type: 'uint8' },
          { name: 'basePower', type: 'uint256' },
          { name: 'level', type: 'uint256' },
        ],
      }],
      functionName: 'getMinerInfo',
      args: [tokenId],
    }) as readonly [`0x${string}`, number, bigint, bigint];

    return {
      owner: result[0],
      rarity: result[1],
      basePower: result[2],
      level: Number(result[3]),
    };
  }

  async getTotalPower(address: `0x${string}`): Promise<bigint> {
    const power = await this.publicClient.readContract({
      address: this.contractAddresses.minerGame,
      abi: [{
        name: 'getTotalPower',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'player', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
      }],
      functionName: 'getTotalPower',
      args: [address],
    });
    return power as bigint;
  }
}
