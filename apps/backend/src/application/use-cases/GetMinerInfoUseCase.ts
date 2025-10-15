import type { BlockchainService } from '../../infrastructure/services/BlockchainService';
import type { MinerDTO } from '../dtos/MinerDTO';

const RARITY_NAMES = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];

export class GetMinerInfoUseCase {
  constructor(private readonly blockchainService: BlockchainService) {}

  async execute(tokenId: string): Promise<MinerDTO> {
    const minerInfo = await this.blockchainService.getMinerInfo(BigInt(tokenId));

    const basePower = minerInfo.basePower;
    const level = minerInfo.level;
    const currentPower = basePower * BigInt(level + 1);
    const upgradeCost = BigInt(level + 1) * 100n * 10n ** 18n;

    return {
      tokenId,
      owner: minerInfo.owner,
      rarity: RARITY_NAMES[minerInfo.rarity] || 'COMMON',
      basePower: basePower.toString(),
      level,
      currentPower: currentPower.toString(),
      upgradeCost: upgradeCost.toString(),
    };
  }
}
