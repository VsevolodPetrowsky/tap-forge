import type { Address } from '../value-objects/Address';

export interface PlayerProps {
  address: Address;
  totalTaps: number;
  totalRewards: bigint;
  tapsSinceCritical: number;
  lastTapBlock: bigint;
  registeredMiners: bigint[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Player entity - represents a game player
 */
export class Player {
  private readonly address: Address;
  private totalTaps: number;
  private totalRewards: bigint;
  private tapsSinceCritical: number;
  private lastTapBlock: bigint;
  private registeredMiners: bigint[];
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(props: PlayerProps) {
    this.address = props.address;
    this.totalTaps = props.totalTaps;
    this.totalRewards = props.totalRewards;
    this.tapsSinceCritical = props.tapsSinceCritical;
    this.lastTapBlock = props.lastTapBlock;
    this.registeredMiners = props.registeredMiners;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(address: Address): Player {
    return new Player({
      address,
      totalTaps: 0,
      totalRewards: 0n,
      tapsSinceCritical: 0,
      lastTapBlock: 0n,
      registeredMiners: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstruct(props: PlayerProps): Player {
    return new Player(props);
  }

  // Getters
  getAddress(): Address {
    return this.address;
  }

  getTotalTaps(): number {
    return this.totalTaps;
  }

  getTotalRewards(): bigint {
    return this.totalRewards;
  }

  getTapsSinceCritical(): number {
    return this.tapsSinceCritical;
  }

  getLastTapBlock(): bigint {
    return this.lastTapBlock;
  }

  getRegisteredMiners(): bigint[] {
    return [...this.registeredMiners];
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business logic
  recordTap(reward: bigint, isCritical: boolean, blockNumber: bigint): void {
    this.totalTaps++;
    this.totalRewards += reward;
    this.lastTapBlock = blockNumber;

    if (isCritical) {
      this.tapsSinceCritical = 0;
    } else {
      this.tapsSinceCritical++;
    }

    this.updatedAt = new Date();
  }

  registerMiner(tokenId: bigint): void {
    if (!this.registeredMiners.includes(tokenId)) {
      this.registeredMiners.push(tokenId);
      this.updatedAt = new Date();
    }
  }

  unregisterMiner(tokenId: bigint): void {
    this.registeredMiners = this.registeredMiners.filter(id => id !== tokenId);
    this.updatedAt = new Date();
  }

  hasMiner(tokenId: bigint): boolean {
    return this.registeredMiners.includes(tokenId);
  }

  getMinerCount(): number {
    return this.registeredMiners.length;
  }
}
