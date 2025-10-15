import type { Address } from '../value-objects/Address';
import type { TokenId } from '../value-objects/TokenId';

export enum MinerRarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

export interface MinerProps {
  tokenId: TokenId;
  owner: Address;
  rarity: MinerRarity;
  basePower: bigint;
  level: number;
  name: string;
  mintedAt: Date;
}

/**
 * Miner entity - represents an NFT miner
 */
export class Miner {
  private readonly tokenId: TokenId;
  private owner: Address;
  private readonly rarity: MinerRarity;
  private readonly basePower: bigint;
  private level: number;
  private name: string;
  private readonly mintedAt: Date;

  private constructor(props: MinerProps) {
    this.tokenId = props.tokenId;
    this.owner = props.owner;
    this.rarity = props.rarity;
    this.basePower = props.basePower;
    this.level = props.level;
    this.name = props.name;
    this.mintedAt = props.mintedAt;
  }

  static create(
    tokenId: TokenId,
    owner: Address,
    rarity: MinerRarity,
    basePower: bigint,
    name: string,
  ): Miner {
    return new Miner({
      tokenId,
      owner,
      rarity,
      basePower,
      level: 0,
      name,
      mintedAt: new Date(),
    });
  }

  static reconstruct(props: MinerProps): Miner {
    return new Miner(props);
  }

  // Getters
  getTokenId(): TokenId {
    return this.tokenId;
  }

  getOwner(): Address {
    return this.owner;
  }

  getRarity(): MinerRarity {
    return this.rarity;
  }

  getBasePower(): bigint {
    return this.basePower;
  }

  getLevel(): number {
    return this.level;
  }

  getName(): string {
    return this.name;
  }

  getMintedAt(): Date {
    return this.mintedAt;
  }

  // Business logic
  getCurrentPower(): bigint {
    return this.basePower * BigInt(this.level + 1);
  }

  upgrade(): void {
    this.level++;
  }

  rename(newName: string): void {
    if (!newName || newName.length === 0) {
      throw new Error('Name cannot be empty');
    }
    if (newName.length > 32) {
      throw new Error('Name too long (max 32 characters)');
    }
    this.name = newName;
  }

  transferTo(newOwner: Address): void {
    this.owner = newOwner;
  }

  getUpgradeCost(): bigint {
    return BigInt(this.level + 1) * 100n * 10n ** 18n; // (level + 1) * 100 MINE tokens
  }

  getRarityMultiplier(): number {
    switch (this.rarity) {
      case MinerRarity.COMMON:
        return 1;
      case MinerRarity.RARE:
        return 2;
      case MinerRarity.EPIC:
        return 5;
      case MinerRarity.LEGENDARY:
        return 10;
    }
  }
}
