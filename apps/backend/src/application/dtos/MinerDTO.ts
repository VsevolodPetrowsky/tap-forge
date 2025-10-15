export interface MinerDTO {
  tokenId: string;
  owner: string;
  rarity: string;
  basePower: string;
  level: number;
  currentPower: string;
  upgradeCost: string;
  name?: string;
}

export interface MinerCollectionDTO {
  miners: MinerDTO[];
  totalPower: string;
  totalCount: number;
}
