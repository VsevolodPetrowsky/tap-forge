import type { BlockchainService } from '../../infrastructure/services/BlockchainService';
import type { PlayerDTO } from '../dtos/PlayerDTO';

export class GetPlayerInfoUseCase {
  constructor(private readonly blockchainService: BlockchainService) {}

  async execute(address: string): Promise<PlayerDTO> {
    const playerInfo = await this.blockchainService.getPlayerInfo(address as `0x${string}`);
    const totalPower = await this.blockchainService.getTotalPower(address as `0x${string}`);

    return {
      address,
      totalTaps: Number(playerInfo.totalTaps),
      totalRewards: playerInfo.totalRewards.toString(),
      tapsSinceCritical: playerInfo.tapsSinceCritical,
      lastTapBlock: playerInfo.lastTapBlock.toString(),
      registeredMiners: playerInfo.registeredMiners.map(id => id.toString()),
      minerCount: playerInfo.registeredMiners.length,
      totalPower: totalPower.toString(),
    };
  }
}
