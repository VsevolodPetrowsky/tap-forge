import type { BlockchainService } from '../../infrastructure/services/BlockchainService';
import type { BalanceDTO } from '../dtos/BalanceDTO';

export class GetBalanceUseCase {
  constructor(private readonly blockchainService: BlockchainService) {}

  async execute(address: string): Promise<BalanceDTO> {
    const addr = address as `0x${string}`;

    const [ethBalance, tokenBalance, nftBalance] = await Promise.all([
      this.blockchainService.getBalance(addr),
      this.blockchainService.getTokenBalance(addr),
      this.blockchainService.getNFTBalance(addr),
    ]);

    return {
      address,
      ethBalance: ethBalance.toString(),
      tokenBalance: tokenBalance.toString(),
      nftBalance: Number(nftBalance),
    };
  }
}
