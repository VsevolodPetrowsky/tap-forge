import { GetBalanceUseCase } from '../../application/use-cases/GetBalanceUseCase';
import { GetMinerInfoUseCase } from '../../application/use-cases/GetMinerInfoUseCase';
import { GetPlayerInfoUseCase } from '../../application/use-cases/GetPlayerInfoUseCase';

import type { PlayerRepository } from '../../infrastructure/repositories/PlayerRepository';
import type { BlockchainService } from '../../infrastructure/services/BlockchainService';

export interface ResolverContext {
  blockchainService: BlockchainService;
  playerRepository: PlayerRepository;
}

export const resolvers = {
  Query: {
    player: async (_parent: unknown, args: { address: string }, context: ResolverContext) => {
      const useCase = new GetPlayerInfoUseCase(context.blockchainService);
      const player = await useCase.execute(args.address);

      // Cache in database
      context.playerRepository.upsert({
        address: player.address,
        total_taps: player.totalTaps,
        total_rewards: player.totalRewards,
        taps_since_critical: player.tapsSinceCritical,
        last_tap_block: player.lastTapBlock,
        total_power: player.totalPower,
      });

      return player;
    },

    leaderboard: async (
      _parent: unknown,
      args: { limit?: number; offset?: number },
      context: ResolverContext,
    ) => {
      const limit = args.limit ?? 100;
      const offset = args.offset ?? 0;

      const players = context.playerRepository.getLeaderboard(limit, offset);

      return players.map((player, index) => ({
        rank: offset + index + 1,
        address: player.address,
        totalTaps: player.total_taps,
        totalRewards: player.total_rewards,
        totalPower: player.total_power,
      }));
    },

    miner: async (_parent: unknown, args: { tokenId: string }, context: ResolverContext) => {
      const useCase = new GetMinerInfoUseCase(context.blockchainService);
      return await useCase.execute(args.tokenId);
    },

    playerMiners: async (
      _parent: unknown,
      args: { address: string },
      context: ResolverContext,
    ) => {
      const playerInfo = await context.blockchainService.getPlayerInfo(
        args.address as `0x${string}`,
      );
      const useCase = new GetMinerInfoUseCase(context.blockchainService);

      const miners = await Promise.all(
        playerInfo.registeredMiners.map((tokenId) => useCase.execute(tokenId.toString())),
      );

      return miners;
    },

    balance: async (_parent: unknown, args: { address: string }, context: ResolverContext) => {
      const useCase = new GetBalanceUseCase(context.blockchainService);
      return await useCase.execute(args.address);
    },

    contractAddresses: (_parent: unknown, _args: unknown, context: ResolverContext) => {
      const addresses = context.blockchainService.getContractAddresses();
      return {
        minerToken: addresses.minerToken,
        minerNFT: addresses.minerNFT,
        minerGame: addresses.minerGame,
      };
    },

    health: async (_parent: unknown, _args: unknown, context: ResolverContext) => {
      const blockNumber = await context.blockchainService.getBlockNumber();
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        blockNumber: blockNumber.toString(),
      };
    },
  },
};
