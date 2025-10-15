import type { Address } from '../value-objects/Address';
import type { Reward } from '../value-objects/Reward';

export interface TapResult {
  reward: Reward;
  blockNumber: bigint;
  transactionHash: string;
  timestamp: Date;
}

export interface GameSessionProps {
  id: string;
  playerAddress: Address;
  startBlock: bigint;
  endBlock?: bigint;
  totalTaps: number;
  totalRewards: bigint;
  criticalHits: number;
  tapResults: TapResult[];
  createdAt: Date;
  endedAt?: Date;
}

/**
 * GameSession entity - represents a player's game session
 */
export class GameSession {
  private readonly id: string;
  private readonly playerAddress: Address;
  private readonly startBlock: bigint;
  private endBlock?: bigint;
  private totalTaps: number;
  private totalRewards: bigint;
  private criticalHits: number;
  private tapResults: TapResult[];
  private readonly createdAt: Date;
  private endedAt?: Date;

  private constructor(props: GameSessionProps) {
    this.id = props.id;
    this.playerAddress = props.playerAddress;
    this.startBlock = props.startBlock;
    this.endBlock = props.endBlock;
    this.totalTaps = props.totalTaps;
    this.totalRewards = props.totalRewards;
    this.criticalHits = props.criticalHits;
    this.tapResults = props.tapResults;
    this.createdAt = props.createdAt;
    this.endedAt = props.endedAt;
  }

  static create(playerAddress: Address, startBlock: bigint): GameSession {
    return new GameSession({
      id: `${playerAddress.toString()}-${Date.now()}`,
      playerAddress,
      startBlock,
      totalTaps: 0,
      totalRewards: 0n,
      criticalHits: 0,
      tapResults: [],
      createdAt: new Date(),
    });
  }

  static reconstruct(props: GameSessionProps): GameSession {
    return new GameSession(props);
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getPlayerAddress(): Address {
    return this.playerAddress;
  }

  getStartBlock(): bigint {
    return this.startBlock;
  }

  getEndBlock(): bigint | undefined {
    return this.endBlock;
  }

  getTotalTaps(): number {
    return this.totalTaps;
  }

  getTotalRewards(): bigint {
    return this.totalRewards;
  }

  getCriticalHits(): number {
    return this.criticalHits;
  }

  getTapResults(): TapResult[] {
    return [...this.tapResults];
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getEndedAt(): Date | undefined {
    return this.endedAt;
  }

  isActive(): boolean {
    return !this.endedAt;
  }

  // Business logic
  addTapResult(
    reward: Reward,
    blockNumber: bigint,
    transactionHash: string,
  ): void {
    if (!this.isActive()) {
      throw new Error('Cannot add tap result to ended session');
    }

    this.totalTaps++;
    this.totalRewards += reward.getTotalAmount();

    if (reward.isCriticalHit()) {
      this.criticalHits++;
    }

    this.tapResults.push({
      reward,
      blockNumber,
      transactionHash,
      timestamp: new Date(),
    });
  }

  endSession(endBlock: bigint): void {
    if (!this.isActive()) {
      throw new Error('Session already ended');
    }

    this.endBlock = endBlock;
    this.endedAt = new Date();
  }

  getDuration(): number | undefined {
    if (!this.endedAt) {
      return undefined;
    }
    return this.endedAt.getTime() - this.createdAt.getTime();
  }

  getAverageRewardPerTap(): bigint {
    if (this.totalTaps === 0) {
      return 0n;
    }
    return this.totalRewards / BigInt(this.totalTaps);
  }

  getCriticalHitRate(): number {
    if (this.totalTaps === 0) {
      return 0;
    }
    return (this.criticalHits / this.totalTaps) * 100;
  }
}
